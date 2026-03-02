/**
 * @fileoverview RadarMapPanel — Leaflet map with NASA GIBS MODIS true-colour overlay.
 *
 * Requires react-leaflet and leaflet to be installed (npm install leaflet react-leaflet).
 * Leaflet CSS is imported globally in index.css.
 *
 * Data source: NASA Global Imagery Browse Services (GIBS)
 * https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs
 */

import { useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, LayersControl, useMap } from 'react-leaflet';

const { BaseLayer, Overlay } = LayersControl;

// Default map centre: world overview
const DEFAULT_CENTER = [20, 0];
const DEFAULT_ZOOM = 2;

/**
 * Inner component that flies to a new location when it changes.
 * Must be rendered inside a <MapContainer>.
 */
function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            try {
                map.flyTo(center, 5, { duration: 1.5 });
            } catch {
                // Silently ignore if map is not yet fully visible/mounted
            }
        }
    }, [map, center]);
    return null;
}

/**
 * @param {{
 *   center?: [number, number] | null,
 *   locationName?: string | null,
 * }} props
 */
export default function RadarMapPanel({ center, locationName }) {
    const mapCenter = center ?? DEFAULT_CENTER;

    return (
        <section className="panel radar-panel">
            <div className="radar-header">
                <h2>Weather Radar Map</h2>
                <span className="radar-badge">Live NASA Imagery</span>
            </div>
            <p className="hint">
                {locationName
                    ? `Showing area around ${locationName}. `
                    : 'Global view. '}
                Overlay: MODIS Terra True Colour (NASA GIBS) — updated daily.
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
                        {/* ── Base layers ──────────────────────────────────────────────── */}
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

                        {/* ── NASA GIBS Overlays ────────────────────────────────────────── */}
                        <Overlay checked name="MODIS Terra True Colour (NASA)">
                            <WMSTileLayer
                                url="https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi"
                                layers="MODIS_Terra_CorrectedReflectance_TrueColor"
                                format="image/jpeg"
                                transparent={false}
                                attribution='Imagery courtesy of <a href="https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs">NASA GIBS</a>'
                                opacity={0.85}
                                maxZoom={9}
                            />
                        </Overlay>

                        <Overlay name="VIIRS Day/Night Band (NASA)">
                            <WMSTileLayer
                                url="https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi"
                                layers="VIIRS_Black_Marble"
                                format="image/png"
                                transparent
                                attribution='Imagery courtesy of <a href="https://earthdata.nasa.gov">NASA</a>'
                                opacity={0.7}
                                maxZoom={8}
                            />
                        </Overlay>

                        <Overlay name="MODIS Aqua True Colour (NASA)">
                            <WMSTileLayer
                                url="https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi"
                                layers="MODIS_Aqua_CorrectedReflectance_TrueColor"
                                format="image/jpeg"
                                transparent={false}
                                attribution='Imagery courtesy of <a href="https://earthdata.nasa.gov">NASA</a>'
                                opacity={0.85}
                                maxZoom={9}
                            />
                        </Overlay>
                    </LayersControl>
                </MapContainer>
            </div>

            <div className="radar-legend">
                <div className="legend-item">
                    <span className="legend-swatch" style={{ background: '#e8f4fd' }} />
                    Cloud / Snow
                </div>
                <div className="legend-item">
                    <span className="legend-swatch" style={{ background: '#2d6a9f' }} />
                    Ocean
                </div>
                <div className="legend-item">
                    <span className="legend-swatch" style={{ background: '#4a7c59' }} />
                    Vegetation
                </div>
                <div className="legend-item">
                    <span className="legend-swatch" style={{ background: '#c8a96e' }} />
                    Desert / Bare
                </div>
            </div>
        </section>
    );
}
