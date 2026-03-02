/**
 * @fileoverview DatePanel — date picker with day-of-year helper text.
 */

import { dateToDayOfYear } from '../api/nasaPower.js';

/**
 * @param {{ value: string, onChange: (v: string) => void }} props
 */
export default function DatePanel({ value, onChange }) {
    const doy = value ? dateToDayOfYear(value) : null;

    return (
        <section className="panel">
            <h2>
                <span className="panel-step">2</span> Select Date
            </h2>
            <div className="input-icon-wrap">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                    type="date"
                    id="date-input"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    aria-label="Date"
                />
            </div>
            <p className="hint">
                {doy
                    ? `Day ${doy} of the year — climatology uses the ±7-day seasonal window for robust statistics.`
                    : 'Select a date to see which day-of-year will be analysed.'}
            </p>
        </section>
    );
}
