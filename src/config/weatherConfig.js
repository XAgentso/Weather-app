/**
 * @fileoverview Central configuration for the NASA Weather Likelihood Dashboard.
 * Adjust thresholds, API endpoints, and location presets here without touching
 * individual components or service modules.
 */

// ── NASA POWER API ────────────────────────────────────────────────────────────
/** Base URL for the NASA POWER daily-point temporal endpoint. */
export const POWER_BASE_URL =
  'https://power.larc.nasa.gov/api/temporal/daily/point';

/**
 * 30-year standard climate-normal window (WMO recommended 1991-2020).
 * Wider windows give more stable statistics; narrower windows reflect recent trends.
 */
export const CLIMATE_START_YEAR = 1991;
export const CLIMATE_END_YEAR = 2020;

/**
 * Number of days either side of the selected day-of-year to include.
 * ±7 days → ~15-day seasonal window per year ≈ 450 data-days over 30 years.
 */
export const DOY_WINDOW = 7;

// ── Weather Thresholds ────────────────────────────────────────────────────────
/** T2M_MAX ≥ this (°C) → "very hot" day. 32 °C ≈ 90 °F. */
export const HOT_THRESHOLD_C = 32;

/** T2M_MIN ≤ this (°C) → "very cold" day. 0 °C = freezing. */
export const COLD_THRESHOLD_C = 0;

/** WS10M ≥ this (m/s) → "very windy" day. 11 m/s ≈ 25 mph (Beaufort 6). */
export const WIND_THRESHOLD_MS = 11;

/** PRECTOTCORR ≥ this (mm/day) → "very wet" day. 10 mm ≈ heavy rain threshold. */
export const PRECIP_THRESHOLD_MM = 10;

/**
 * Uncomfortable day: T2M_MAX ≥ this (°C) AND RH2M ≥ DISCOMFORT_RH_PCT.
 * 28 °C / 70% RH sit squarely in the "oppressively humid" band.
 */
export const DISCOMFORT_TEMP_C = 28;
export const DISCOMFORT_RH_PCT = 70;

// ── NASA POWER Parameters ─────────────────────────────────────────────────────
/** POWER parameter string for daily requests. */
export const POWER_PARAMETERS = 'T2M_MAX,T2M_MIN,PRECTOTCORR,WS10M,RH2M';

// ── NASA GIBS (Global Imagery Browse Services) ────────────────────────────────
/**
 * WMS endpoint used as a Leaflet TileLayer.WMS source.
 * Provides daily global true-colour imagery (MODIS Terra).
 */
export const GIBS_WMS_URL =
  'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi';

/** GIBS layer name — MODIS Terra Corrected Reflectance (True Color). */
export const GIBS_LAYER = 'MODIS_Terra_CorrectedReflectance_TrueColor';

// ── Known Location Presets ────────────────────────────────────────────────────
/**
 * Mapping of common city names to coordinates.
 * Keys are lower-cased for case-insensitive look-up.
 * Add new entries here to expand preset coverage.
 *
 * @type {Record<string, {lat: number, lon: number, displayName: string}>}
 */
export const LOCATION_PRESETS = {
  'new york':    { lat: 40.7128,  lon: -74.0060, displayName: 'New York, USA' },
  'new york city': { lat: 40.7128, lon: -74.0060, displayName: 'New York, USA' },
  'los angeles': { lat: 34.0522,  lon: -118.2437, displayName: 'Los Angeles, USA' },
  'la':          { lat: 34.0522,  lon: -118.2437, displayName: 'Los Angeles, USA' },
  'london':      { lat: 51.5074,  lon: -0.1278,  displayName: 'London, UK' },
  'mumbai':      { lat: 19.0760,  lon: 72.8777,  displayName: 'Mumbai, India' },
  'bombay':      { lat: 19.0760,  lon: 72.8777,  displayName: 'Mumbai, India' },
  'sydney':      { lat: -33.8688, lon: 151.2093, displayName: 'Sydney, Australia' },
  'tokyo':       { lat: 35.6762,  lon: 139.6503, displayName: 'Tokyo, Japan' },
  'denver':      { lat: 39.7392,  lon: -104.9903, displayName: 'Denver, USA' },
  'chicago':     { lat: 41.8781,  lon: -87.6298, displayName: 'Chicago, USA' },
  'dubai':       { lat: 25.2048,  lon: 55.2708,  displayName: 'Dubai, UAE' },
  'paris':       { lat: 48.8566,  lon: 2.3522,   displayName: 'Paris, France' },
  'berlin':      { lat: 52.5200,  lon: 13.4050,  displayName: 'Berlin, Germany' },
  'toronto':     { lat: 43.6532,  lon: -79.3832, displayName: 'Toronto, Canada' },
  'singapore':   { lat: 1.3521,   lon: 103.8198, displayName: 'Singapore' },
  'beijing':     { lat: 39.9042,  lon: 116.4074, displayName: 'Beijing, China' },
  'cairo':       { lat: 30.0444,  lon: 31.2357,  displayName: 'Cairo, Egypt' },
  'mexico city': { lat: 19.4326,  lon: -99.1332, displayName: 'Mexico City, Mexico' },
  'moscow':      { lat: 55.7558,  lon: 37.6176,  displayName: 'Moscow, Russia' },
  'rio':         { lat: -22.9068, lon: -43.1729, displayName: 'Rio de Janeiro, Brazil' },
  'sao paulo':   { lat: -23.5505, lon: -46.6333, displayName: 'São Paulo, Brazil' },
};
