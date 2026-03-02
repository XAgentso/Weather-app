/**
 * @fileoverview RadarMapPanel — Leaflet map with real weather overlays.
 *
 * Weather layers (no API key required):
 *   - RainViewer: Live global precipitation radar (fetches its own timestamps)
 *   - NASA GIBS:  MODIS Terra True Colour satellite imagery (with correct date)
 *
 * Base maps:
 *   - OpenStreetMap (default — works best with weather overlays)
 *   - CartoDB Dark  (great for seeing precipitation colours)
 */

import { useEffect, useState, useRef } from 'react';
import {
    MapContainer, TileLayer, LayersControl, useMap,
} from 'react-leaflet';

const { BaseLayer, Overlay } = LayersControl;

const DEFAULT_CENTER = [20, 0];
const DEFAULT_ZOOM = 2;

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Returns yesterday's date as 'YYYY-MM-DD' (GIBS availability lags ~1–2 days). */
function gibs_date() {
    const d = new Date();
    d.setDate(d.getDate() - 2); // 2-day lag for MODIS availability
    return d.toISOString().slice(0, 10);
}

/**
 * Fetches the latest available RainViewer radar timestamp list.
 * Docs: https://www.rainviewer.com/api/weather-maps.html
 */
async function fetchRainViewerUrl() {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (!res.ok) throw new Error('RainViewer API unreachable');
    const data = await res.json();
    // Use the most recent past frame
    const frames = data.radar?.past ?? [];
    if (!frames.length) throw new Error('No radar frames available');
    const latest = frames[frames.length - 1];
    // Returns tile URL template; size=512 for high-res
    return `https://tilecache.rainviewer.com${latest.path}/512/{z}/{x}/{y}/2/1_1.png`;
}

// ── MapController: fly-to on location change ──────────────────────────────────

function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            try { map.flyTo(center, 5, { duration: 1.5 }); } catch { /* ignore */ }
        }
    }, [map, center]);
    return null;
}

// ── RainViewerLayer: fetches timestamps and renders ───────────────────────────

function RainViewerLayer() {
    const [tileUrl, setTileUrl] = useState(null);
    const [error, setError] = useState(false);
    const fetched = useRef(false);

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;
        fetchRainViewerUrl()
            .then(setTileUrl)
            .catch(() => setError(true));
    }, []);

    if (error || !tileUrl) return null;

    return (
        <TileLayer
            url={tileUrl}
            opacity={0.7}
            attribution='Radar: <a href="https://www.rainviewer.com" target="_blank">RainViewer</a>'
            tileSize={512}
            zoomOffset={-1}
        />
    );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {{
 *   center?: [number, number] | null,
 *   locationName?: string | null,
 * }} props
 */
export default function RadarMapPanel({ center, locationName }) {
    const mapCenter = center ?? DEFAULT_CENTER;
    const gibsDate = gibs_date();

    return (
        <section className="panel radar-panel">
            <div className="radar-header">
                <h2>Weather Radar Map</h2>
                <span className="radar-badge">Live Precipitation</span>
            </div>
            <p className="hint">
                {locationName ? `Showing area around ${locationName}. ` : 'Global view. '}
                Base layer: precipitation radar via RainViewer (updated ~10 min).
                Toggle layers ↗ to switch to NASA satellite view.
            </p>

            <div className="map-container">
                <MapContainer
                    center={mapCenter}
                    zoom={center ? 5 : DEFAULT_ZOOM}
                    style={{ height: '100%', width: '100%', borderRadius: '12px' }}
                    scrollWheelZoom
                    aria-label="Weather radar map"
                >
                    <MapController center={center ?? null} />

                    <LayersControl position="topright">

                        {/* ── Base layers ─────────────────────────────────────────────── */}
                        <BaseLayer checked name="OpenStreetMap">
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                maxZoom={19}
                            />
                        </BaseLayer>

                        <BaseLayer name="Dark (CartoDB)">
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                                maxZoom={19}
                            />
                        </BaseLayer>

                        {/* ── Weather overlays ─────────────────────────────────────────── */}

                        {/* LIVE precipitation radar — RainViewer (no API key needed) */}
                        <Overlay checked name="🌧 Precipitation Radar (RainViewer)">
                            <RainViewerLayer />
                        </Overlay>

                        {/* NASA GIBS daily satellite cloud/surface view (with correct date) */}
                        <Overlay name={`🛰 MODIS Cloud View – NASA (${gibsDate})`}>
                            <TileLayer
                                url={`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${gibsDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`}
                                attribution='Imagery <a href="https://earthdata.nasa.gov">NASA GIBS</a>'
                                opacity={0.8}
                                maxZoom={9}
                                maxNativeZoom={9}
                            />
                        </Overlay>

                    </LayersControl>
                </MapContainer>
            </div>

            {/* Legend */}
            <div className="radar-legend">
                <div className="legend-item">
                    <span className="legend-swatch" style={{ background: '#38bdf8' }} />
                    Light rain
                </div>
                <div className="legend-item">
                    <span className="legend-swatch" style={{ background: '#2563eb' }} />
                    Moderate rain
                </div>
                <div className="legend-item">
                    <span className="legend-swatch" style={{ background: '#7c3aed' }} />
                    Heavy rain
                </div>
                <div className="legend-item">
                    <span className="legend-swatch" style={{ background: '#dc2626' }} />
                    Extreme
                </div>
            </div>
        </section>
    );
}
