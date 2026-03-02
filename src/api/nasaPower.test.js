/**
 * @fileoverview Unit tests for the NASA POWER climatology calculation logic.
 * Network calls are mocked so tests run fully offline.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchDailyClimatology, dateToDayOfYear } from './nasaPower.js'

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Build a minimal NASA POWER API response JSON with the given daily values.
 * @param {Record<string, number>} t2mMax
 * @param {Record<string, number>} t2mMin
 * @param {Record<string, number>} precip
 * @param {Record<string, number>} wind
 * @param {Record<string, number>} rh
 */
function makePowerResponse(t2mMax, t2mMin, precip, wind, rh) {
    return {
        properties: {
            parameter: {
                T2M_MAX: t2mMax,
                T2M_MIN: t2mMin,
                PRECTOTCORR: precip,
                WS10M: wind,
                RH2M: rh,
            },
        },
    }
}

/**
 * Generate day keys (YYYYMMDD) around July 15 (DOY ~196) for 30 years (1991–2020)
 * using days 193–199 (±3 days of 196, fits inside a ±7 window).
 * @param {number} value - Fill value for all parameters.
 * @returns {Record<string, number>}
 */
function generateKeys(value) {
    const result = {}
    for (let year = 1991; year <= 2020; year++) {
        // July 12–18 (days 193–199 non-leap)
        for (let day = 12; day <= 18; day++) {
            const d = String(day).padStart(2, '0')
            result[`${year}07${d}`] = value
        }
    }
    return result
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('dateToDayOfYear', () => {
    it('returns 1 for Jan 1', () => {
        expect(dateToDayOfYear('2025-01-01')).toBe(1)
    })

    it('returns 196 for July 15 (non-leap year)', () => {
        expect(dateToDayOfYear('2025-07-15')).toBe(196)
    })

    it('returns 366 for Dec 31 in a leap year', () => {
        expect(dateToDayOfYear('2024-12-31')).toBe(366)
    })
})

describe('fetchDailyClimatology', () => {
    const GEO = { lat: 19.076, lon: 72.877, displayName: 'Mumbai, India' }

    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    function mockFetch(data) {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => data,
        })
    }

    it('returns 100% probability when all days exceed hot threshold', async () => {
        mockFetch(makePowerResponse(
            generateKeys(40),   // T2M_MAX = 40°C  (> 32 threshold)
            generateKeys(20),
            generateKeys(0),
            generateKeys(0),
            generateKeys(0),
        ))

        const result = await fetchDailyClimatology({
            ...GEO,
            dayOfYear: 196,
            variables: { veryHot: true },
        })

        expect(result.entries).toHaveLength(1)
        expect(result.entries[0].probability).toBe(100)
        expect(result.entries[0].icon).toBe('hot')
    })

    it('returns 0% when no days exceed hot threshold', async () => {
        mockFetch(makePowerResponse(
            generateKeys(20),   // T2M_MAX = 20°C  (< 32 threshold)
            generateKeys(10),
            generateKeys(0),
            generateKeys(0),
            generateKeys(0),
        ))

        const result = await fetchDailyClimatology({
            ...GEO,
            dayOfYear: 196,
            variables: { veryHot: true },
        })

        expect(result.entries[0].probability).toBe(0)
    })

    it('correctly computes cold probability', async () => {
        // Half the years have min below 0, half above
        const minData = {}
        for (let year = 1991; year <= 2020; year++) {
            for (let day = 12; day <= 18; day++) {
                const d = String(day).padStart(2, '0')
                minData[`${year}07${d}`] = year % 2 === 0 ? -5 : 10  // alternating cold/warm
            }
        }

        mockFetch(makePowerResponse(
            generateKeys(10),
            minData,
            generateKeys(0),
            generateKeys(0),
            generateKeys(0),
        ))

        const result = await fetchDailyClimatology({
            ...GEO,
            dayOfYear: 196,
            variables: { veryCold: true },
        })

        // 15 out of 30 years have even year → ~50% cold days
        expect(result.entries[0].probability).toBe(50)
        expect(result.entries[0].icon).toBe('cold')
    })

    it('computes uncomfortable probability with dual conditions', async () => {
        // All days with T2M_MAX=35 and RH=80 → 100% uncomfortable
        mockFetch(makePowerResponse(
            generateKeys(35),
            generateKeys(20),
            generateKeys(0),
            generateKeys(0),
            generateKeys(80),
        ))

        const result = await fetchDailyClimatology({
            ...GEO,
            dayOfYear: 196,
            variables: { veryUncomfortable: true },
        })

        expect(result.entries[0].probability).toBe(100)
        expect(result.entries[0].icon).toBe('uncomfortable')
    })

    it('throws when no variables selected', async () => {
        mockFetch(makePowerResponse(
            generateKeys(30),
            generateKeys(10),
            generateKeys(0),
            generateKeys(0),
            generateKeys(0),
        ))

        await expect(
            fetchDailyClimatology({
                ...GEO,
                dayOfYear: 196,
                variables: {},   // no variables selected
            }),
        ).rejects.toThrow(/at least one weather condition/i)
    })

    it('throws when POWER API returns non-ok status', async () => {
        fetch.mockResolvedValue({ ok: false, status: 503 })

        await expect(
            fetchDailyClimatology({
                ...GEO,
                dayOfYear: 196,
                variables: { veryHot: true },
            }),
        ).rejects.toThrow(/HTTP 503/i)
    })

    it('throws when network fails', async () => {
        fetch.mockRejectedValue(new TypeError('Failed to fetch'))

        await expect(
            fetchDailyClimatology({
                ...GEO,
                dayOfYear: 196,
                variables: { veryHot: true },
            }),
        ).rejects.toThrow(/unable to reach/i)
    })

    it('includes daysAnalysed and yearsAnalysed in result', async () => {
        mockFetch(makePowerResponse(
            generateKeys(30),
            generateKeys(10),
            generateKeys(0),
            generateKeys(0),
            generateKeys(0),
        ))

        const result = await fetchDailyClimatology({
            ...GEO,
            dayOfYear: 196,
            variables: { veryHot: true },
        })

        expect(result.yearsAnalysed).toBe(30)
        expect(result.daysAnalysed).toBeGreaterThan(0)
        expect(result.summary).toContain('Mumbai, India')
    })
})
