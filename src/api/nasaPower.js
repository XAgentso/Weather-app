/**
 * @fileoverview NASA POWER API service for historical climate probability computation.
 *
 * Uses the NASA POWER daily-point endpoint to fetch 30 years of climate data
 * and derives weather condition probabilities for a given location and day-of-year.
 *
 * No API key is required. The POWER API is publicly accessible.
 * Docs: https://power.larc.nasa.gov/docs/services/api/
 */

import {
    POWER_BASE_URL,
    POWER_PARAMETERS,
    CLIMATE_START_YEAR,
    CLIMATE_END_YEAR,
    DOY_WINDOW,
    HOT_THRESHOLD_C,
    COLD_THRESHOLD_C,
    WIND_THRESHOLD_MS,
    PRECIP_THRESHOLD_MM,
    DISCOMFORT_TEMP_C,
    DISCOMFORT_RH_PCT,
} from '../config/weatherConfig.js';

// ── Types (JSDoc) ─────────────────────────────────────────────────────────────

/**
 * @typedef {{
 *   label: string;
 *   probability: number;
 *   icon: string;
 *   color: string;
 * }} LikelihoodEntry
 */

/**
 * @typedef {{
 *   summary: string;
 *   entries: LikelihoodEntry[];
 *   location: { lat: number, lon: number, displayName: string };
 *   dayOfYear: number;
 *   yearsAnalysed: number;
 *   daysAnalysed: number;
 * }} LikelihoodResult
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convert a JavaScript Date to ISO date string "YYYYMMDD" (POWER API format).
 * @param {Date} d
 * @returns {string}
 */
function toISOCompact(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
}

/**
 * Convert a date string "YYYYMMDD" to day-of-year (1–366).
 * @param {string} yyyymmdd
 * @returns {number}
 */
function doyFromCompact(yyyymmdd) {
    const y = parseInt(yyyymmdd.slice(0, 4), 10);
    const m = parseInt(yyyymmdd.slice(4, 6), 10);
    const d = parseInt(yyyymmdd.slice(6, 8), 10);
    const start = new Date(y, 0, 0);
    const date = new Date(y, m - 1, d);
    const diff = date - start;
    return Math.floor(diff / 86_400_000);
}

/**
 * Check whether a day-of-year falls within ±window of a target, accounting
 * for year-wrap (e.g., Day 3 is within 7 days of Day 360).
 * @param {number} doy - Candidate day-of-year.
 * @param {number} target - Target day-of-year.
 * @param {number} window - Half-window in days.
 * @returns {boolean}
 */
function inDoyWindow(doy, target, window) {
    const diff = Math.abs(doy - target);
    return diff <= window || diff >= 365 - window;
}

// ── Main API Function ─────────────────────────────────────────────────────────

/**
 * Fetch 30 years of daily climatology from NASA POWER and compute weather
 * condition probabilities for the supplied location and day-of-year.
 *
 * @param {{
 *   lat: number,
 *   lon: number,
 *   displayName: string,
 *   dayOfYear: number,
 *   variables: {
 *     veryHot?: boolean,
 *     veryCold?: boolean,
 *     veryWindy?: boolean,
 *     veryWet?: boolean,
 *     veryUncomfortable?: boolean,
 *   }
 * }} params
 * @returns {Promise<LikelihoodResult>}
 */
export async function fetchDailyClimatology(params) {
    const { lat, lon, displayName, dayOfYear, variables } = params;

    // Build the POWER request URL
    const url = new URL(POWER_BASE_URL);
    url.searchParams.set('parameters', POWER_PARAMETERS);
    url.searchParams.set('community', 'RE');
    url.searchParams.set('longitude', String(lon));
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set(
        'start',
        toISOCompact(new Date(CLIMATE_START_YEAR, 0, 1)),
    );
    url.searchParams.set(
        'end',
        toISOCompact(new Date(CLIMATE_END_YEAR, 11, 31)),
    );
    url.searchParams.set('format', 'JSON');

    let res;
    try {
        res = await fetch(url.toString());
    } catch {
        throw new Error(
            'Unable to reach the NASA POWER API. Please check your internet connection.',
        );
    }

    if (!res.ok) {
        throw new Error(
            `NASA POWER API returned HTTP ${res.status}. Please try again later.`,
        );
    }

    const json = await res.json();

    // POWER response structure: json.properties.parameter.<PARAM>.<YYYYMMDD>
    const paramData = json?.properties?.parameter;
    if (!paramData) {
        throw new Error(
            'Unexpected response format from NASA POWER. The API may have changed.',
        );
    }

    const T2M_MAX = paramData['T2M_MAX'] ?? {};
    const T2M_MIN = paramData['T2M_MIN'] ?? {};
    const PRECIP = paramData['PRECTOTCORR'] ?? {};
    const WIND = paramData['WS10M'] ?? {};
    const RH = paramData['RH2M'] ?? {};

    // ── Filter to seasonal window ──────────────────────────────────────────────
    // Iterate over keys (YYYYMMDD) and keep only those within ±DOY_WINDOW.
    const filteredDates = Object.keys(T2M_MAX).filter((key) => {
        const v = T2M_MAX[key];
        // POWER uses -999 as fill value for missing data
        if (v === undefined || v <= -990) return false;
        const doy = doyFromCompact(key);
        return inDoyWindow(doy, dayOfYear, DOY_WINDOW);
    });

    const totalDays = filteredDates.length;
    if (totalDays === 0) {
        throw new Error(
            'No historical data returned for this location. It may be outside the NASA POWER coverage area.',
        );
    }

    // ── Probability computation ────────────────────────────────────────────────

    /**
     * Count fraction of days where predicate returns true.
     * @param {(key: string) => boolean} predicate
     * @returns {number} 0–100
     */
    function pct(predicate) {
        const count = filteredDates.filter(predicate).length;
        return Math.round((count / totalDays) * 100);
    }

    /** Safely read a POWER value, treating fill values as null. */
    const val = (param, key) => {
        const v = param[key];
        return v !== undefined && v > -990 ? v : null;
    };

    const entries = [];

    if (variables.veryHot) {
        const probability = pct(
            (k) => val(T2M_MAX, k) !== null && val(T2M_MAX, k) >= HOT_THRESHOLD_C,
        );
        entries.push({
            label: `Very hot ≥ ${HOT_THRESHOLD_C}°C (${Math.round(HOT_THRESHOLD_C * 9 / 5 + 32)}°F)`,
            probability,
            icon: 'hot',
            color: '#ff6b35',
        });
    }

    if (variables.veryCold) {
        const probability = pct(
            (k) => val(T2M_MIN, k) !== null && val(T2M_MIN, k) <= COLD_THRESHOLD_C,
        );
        entries.push({
            label: `Very cold ≤ ${COLD_THRESHOLD_C}°C (32°F)`,
            probability,
            icon: 'cold',
            color: '#74c0fc',
        });
    }

    if (variables.veryWindy) {
        const probability = pct(
            (k) => val(WIND, k) !== null && val(WIND, k) >= WIND_THRESHOLD_MS,
        );
        const mph = Math.round(WIND_THRESHOLD_MS * 2.237);
        entries.push({
            label: `Very windy ≥ ${WIND_THRESHOLD_MS} m/s (${mph} mph)`,
            probability,
            icon: 'wind',
            color: '#a9e34b',
        });
    }

    if (variables.veryWet) {
        const probability = pct(
            (k) =>
                val(PRECIP, k) !== null && val(PRECIP, k) >= PRECIP_THRESHOLD_MM,
        );
        entries.push({
            label: `Very wet ≥ ${PRECIP_THRESHOLD_MM} mm/day`,
            probability,
            icon: 'wet',
            color: '#4dabf7',
        });
    }

    if (variables.veryUncomfortable) {
        const probability = pct(
            (k) =>
                val(T2M_MAX, k) !== null &&
                val(RH, k) !== null &&
                val(T2M_MAX, k) >= DISCOMFORT_TEMP_C &&
                val(RH, k) >= DISCOMFORT_RH_PCT,
        );
        entries.push({
            label: `Very uncomfortable (≥${DISCOMFORT_TEMP_C}°C + ≥${DISCOMFORT_RH_PCT}% RH)`,
            probability,
            icon: 'uncomfortable',
            color: '#da77f2',
        });
    }

    if (entries.length === 0) {
        throw new Error('Please select at least one weather condition to compute.');
    }

    // ── Build summary sentence ─────────────────────────────────────────────────
    const yearsAnalysed = CLIMATE_END_YEAR - CLIMATE_START_YEAR + 1;
    const high = entries.reduce(
        (best, e) => (e.probability > best.probability ? e : best),
        entries[0],
    );

    const summary =
        `Based on ${yearsAnalysed} years of climate data (${CLIMATE_START_YEAR}–${CLIMATE_END_YEAR}) ` +
        `for ${displayName}, analysing ${totalDays} days ±${DOY_WINDOW}d around this time of year. ` +
        `Most likely condition: ${high.label} at ${high.probability}%.`;

    return {
        summary,
        entries,
        location: { lat, lon, displayName },
        dayOfYear,
        yearsAnalysed,
        daysAnalysed: totalDays,
    };
}

/**
 * Convert a "YYYY-MM-DD" date string to day-of-year (1–366).
 * Exported so App.jsx can derive dayOfYear from the date picker value.
 *
 * @param {string} dateStr - e.g. "2025-07-15"
 * @returns {number} Day-of-year 1–366.
 */
export function dateToDayOfYear(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const start = new Date(y, 0, 0);
    const date = new Date(y, m - 1, d);
    return Math.floor((date - start) / 86_400_000);
}
