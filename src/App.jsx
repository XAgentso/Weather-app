/**
 * @fileoverview Root application component.
 *
 * Orchestrates:
 * - Location selection (with geocoding)
 * - Date selection
 * - Condition toggles
 * - onCompute → NASA POWER climatology call
 * - Tab navigation: Dashboard | Radar Map
 */

import { useState } from 'react';
import './App.css';

import LocationPanel from './components/LocationPanel.jsx';
import DatePanel from './components/DatePanel.jsx';
import ConditionsPanel from './components/ConditionsPanel.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import RadarMapPanel from './components/RadarMapPanel.jsx';

import { resolveLocation } from './api/geocoding.js';
import { fetchDailyClimatology, dateToDayOfYear } from './api/nasaPower.js';

/** @typedef {'dashboard' | 'radar'} Tab */

function App() {
  // ── Input state ────────────────────────────────────────────────────────────
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [variables, setVariables] = useState({
    veryHot: true,
    veryCold: false,
    veryWindy: false,
    veryWet: false,
    veryUncomfortable: false,
  });

  // ── Output state ───────────────────────────────────────────────────────────
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Resolved coordinates (for the radar map fly-to) ───────────────────────
  const [resolvedCoords, setResolvedCoords] = useState(null); // [lat, lon] | null
  const [resolvedName, setResolvedName] = useState(null);

  // ── Tab state ──────────────────────────────────────────────────────────────
  /** @type {[Tab, React.Dispatch<React.SetStateAction<Tab>>]} */
  const [activeTab, setActiveTab] = useState('dashboard');
  // Lazy-mount the radar panel: only render once first visited so Leaflet
  // doesn't initialise inside a display:none container on first compute.
  const [hasSeenRadar, setHasSeenRadar] = useState(false);

  function switchTab(tab) {
    setActiveTab(tab);
    if (tab === 'radar') setHasSeenRadar(true);
  }

  function toggleVariable(key) {
    setVariables((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // ── Main compute handler ───────────────────────────────────────────────────
  async function onCompute() {
    if (!location.trim() || !date) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // 1. Geocode the location
      const geo = await resolveLocation(location.trim());
      setResolvedCoords([geo.lat, geo.lon]);
      setResolvedName(geo.displayName);

      // 2. Derive day-of-year from the selected date
      const dayOfYear = dateToDayOfYear(date);

      // 3. Fetch & compute climatology probabilities via NASA POWER
      const likelihoodResult = await fetchDailyClimatology({
        lat: geo.lat,
        lon: geo.lon,
        displayName: geo.displayName,
        dayOfYear,
        variables,
      });

      setResults(likelihoodResult);
    } catch (err) {
      setError(err.message ?? 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }

  const canCompute = Boolean(location.trim() && date && !loading);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app-root">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-logo">
            <svg viewBox="0 0 40 40" fill="none" className="logo-svg" aria-hidden="true">
              <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const r1 = 12, r2 = 16;
                const rad = (deg * Math.PI) / 180;
                return (
                  <line key={deg}
                    x1={20 + r1 * Math.cos(rad)} y1={20 + r1 * Math.sin(rad)}
                    x2={20 + r2 * Math.cos(rad)} y2={20 + r2 * Math.sin(rad)}
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                );
              })}
            </svg>
          </div>
          <div>
            <h1>Weather Likelihood Dashboard</h1>
            <p className="subtitle">
              Historical climate probabilities powered by NASA POWER — not a forecast, but a climatological view.
            </p>
          </div>
        </div>

        {/* ── Tab bar ─────────────────────────────────────────────────────── */}
        <nav className="tab-bar" role="tablist" aria-label="Main navigation">
          <button
            role="tab"
            aria-selected={activeTab === 'dashboard'}
            className={`tab-btn ${activeTab === 'dashboard' ? 'tab-btn--active' : ''}`}
            onClick={() => switchTab('dashboard')}
          >
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, marginRight: 6 }}>
              <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            Dashboard
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'radar'}
            className={`tab-btn ${activeTab === 'radar' ? 'tab-btn--active' : ''}`}
            onClick={() => switchTab('radar')}
          >
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, marginRight: 6 }}>
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Radar Map
          </button>
        </nav>
      </header>

      {/* ── Dashboard tab ─────────────────────────────────────────────────── */}
      <main
        id="dashboard-panel"
        role="tabpanel"
        aria-label="Dashboard"
        className={`tab-content ${activeTab === 'dashboard' ? 'tab-content--active' : ''}`}
      >
        <div className="dashboard-grid">
          <div className="input-column">
            <LocationPanel
              value={location}
              onChange={setLocation}
              resolvedName={resolvedName}
            />
            <DatePanel value={date} onChange={setDate} />
            <ConditionsPanel variables={variables} onToggle={toggleVariable} />

            <section className="panel actions-panel">
              <button
                id="compute-btn"
                className="compute-btn"
                onClick={onCompute}
                disabled={!canCompute}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" />
                    Computing…
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, marginRight: 8 }}>
                      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Compute Likelihood
                  </>
                )}
              </button>
              {!location.trim() && <p className="hint">Enter a location to enable compute.</p>}
              {location.trim() && !date && <p className="hint">Select a date to enable compute.</p>}
            </section>
          </div>

          <div className="results-column">
            <ResultsPanel results={results} loading={loading} error={error} />
          </div>
        </div>
      </main>

      {/* ── Radar Map tab — lazy-mounted on first visit ────────────────────── */}
      <main
        id="radar-panel"
        role="tabpanel"
        aria-label="Radar Map"
        className={`tab-content ${activeTab === 'radar' ? 'tab-content--active' : ''}`}
      >
        {hasSeenRadar && (
          <RadarMapPanel
            center={resolvedCoords}
            locationName={resolvedName}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Climatology data: <a href="https://power.larc.nasa.gov/" target="_blank" rel="noopener noreferrer">NASA POWER</a> (1991–2020 climate normals) ·
          Map imagery: <a href="https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs" target="_blank" rel="noopener noreferrer">NASA GIBS</a> ·
          Geocoding: <a href="https://nominatim.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap Nominatim</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
