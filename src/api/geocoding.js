/**
 * @fileoverview Location resolution: city name → {lat, lon, displayName}.
 *
 * Strategy:
 * 1. Check LOCATION_PRESETS (instant, no network).
 * 2. Fall back to Nominatim (OpenStreetMap) — free, no API key required.
 */

import { LOCATION_PRESETS } from '../config/weatherConfig.js';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * @typedef {{ lat: number, lon: number, displayName: string }} LocationResult
 */

/**
 * Resolve a human-readable location name to geographic coordinates.
 *
 * @param {string} name - User-typed location string.
 * @returns {Promise<LocationResult>}
 * @throws {Error} If the location cannot be resolved via presets or Nominatim.
 */
export async function resolveLocation(name) {
    const key = name.trim().toLowerCase();

    // ── 1. Preset look-up (partial match) ─────────────────────────────────────
    // Try exact key first, then check if any preset key starts with the query.
    const exact = LOCATION_PRESETS[key];
    if (exact) return exact;

    // Partial forward match: "new y" → "new york"
    for (const [presetKey, value] of Object.entries(LOCATION_PRESETS)) {
        if (presetKey.startsWith(key) || key.startsWith(presetKey)) {
            return value;
        }
    }

    // ── 2. Nominatim fallback ─────────────────────────────────────────────────
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set('q', name.trim());
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');

    let res;
    try {
        res = await fetch(url.toString(), {
            headers: {
                // Nominatim requires a User-Agent that identifies the app.
                'User-Agent': 'NASA-Weather-Likelihood-Dashboard/1.0',
            },
        });
    } catch {
        throw new Error(
            `Network error while geocoding "${name}". Check your internet connection.`,
        );
    }

    if (!res.ok) {
        throw new Error(`Nominatim returned HTTP ${res.status} for "${name}".`);
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error(
            `Location "${name}" not found. Try a major city name like "London" or "Denver".`,
        );
    }

    const [first] = data;
    return {
        lat: parseFloat(first.lat),
        lon: parseFloat(first.lon),
        displayName: first.display_name.split(',').slice(0, 3).join(',').trim(),
    };
}

/**
 * Returns the list of preset city names for autocomplete suggestions.
 *
 * @returns {string[]} Capitalised display names of all presets.
 */
export function getPresetNames() {
    return Object.values(LOCATION_PRESETS).map((v) => v.displayName);
}
