/**
 * @fileoverview ResultsPanel — displays climatology probabilities with
 * animated progress bars and colour-coded badges.
 */

import WeatherIcon from './WeatherIcon.jsx';

/**
 * @param {{
 *   results: import('../api/nasaPower.js').LikelihoodResult | null,
 *   loading: boolean,
 *   error: string | null,
 * }} props
 */
export default function ResultsPanel({ results, loading, error }) {
    return (
        <section className="panel results-panel">
            <h2>Results</h2>

            {loading && (
                <div className="results-loading">
                    <div className="spinner" />
                    <p>Fetching 30 years of NASA climate data…</p>
                </div>
            )}

            {!loading && error && (
                <div className="results-error" role="alert">
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, marginRight: 8, flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {error}
                </div>
            )}

            {!loading && !error && !results && (
                <p className="hint">Select a location, date, and at least one condition, then click <strong>Compute Likelihood</strong>.</p>
            )}

            {!loading && !error && results && (
                <div className="results-content">
                    <p className="results-summary">{results.summary}</p>

                    <div className="results-meta">
                        <span className="meta-badge">
                            <svg viewBox="0 0 24 24" fill="none" style={{ width: 13 }}>
                                <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {results.yearsAnalysed} years
                        </span>
                        <span className="meta-badge">
                            <svg viewBox="0 0 24 24" fill="none" style={{ width: 13 }}>
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {results.daysAnalysed} days sampled
                        </span>
                    </div>

                    <ul className="entries-list">
                        {results.entries.map((entry) => (
                            <li key={entry.label} className="entry-row">
                                <div className="entry-header">
                                    <span className="entry-icon" style={{ color: entry.color }}>
                                        <WeatherIcon type={entry.icon} size={18} />
                                    </span>
                                    <span className="entry-label">{entry.label}</span>
                                    <span className="entry-pct" style={{ color: entry.color }}>
                                        {entry.probability}%
                                    </span>
                                </div>
                                <div className="progress-track">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            '--fill-width': `${entry.probability}%`,
                                            '--fill-color': entry.color,
                                        }}
                                    />
                                </div>
                                <span className="entry-descriptor">
                                    {probabilityLabel(entry.probability)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}

/**
 * Returns a human-readable qualitative descriptor for a probability percentage.
 * @param {number} pct
 * @returns {string}
 */
function probabilityLabel(pct) {
    if (pct >= 80) return 'Very likely';
    if (pct >= 60) return 'Likely';
    if (pct >= 40) return 'Possible';
    if (pct >= 20) return 'Unlikely';
    return 'Rare';
}
