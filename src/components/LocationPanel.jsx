/**
 * @fileoverview LocationPanel — city search with preset autocomplete + display.
 */

import { useState, useRef, useEffect } from 'react';
import { getPresetNames } from '../api/geocoding.js';

const PRESETS = getPresetNames();

/**
 * @param {{
 *   value: string,
 *   onChange: (v: string) => void,
 *   resolvedName: string | null,
 * }} props
 */
export default function LocationPanel({ value, onChange, resolvedName }) {
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    function handleInput(e) {
        const v = e.target.value;
        onChange(v);
        if (v.trim().length >= 1) {
            const q = v.toLowerCase();
            const filtered = PRESETS.filter((p) => p.toLowerCase().includes(q)).slice(0, 8);
            setSuggestions(filtered);
            setOpen(filtered.length > 0);
        } else {
            setSuggestions([]);
            setOpen(false);
        }
    }

    function pick(name) {
        onChange(name);
        setOpen(false);
        setSuggestions([]);
    }

    // Close dropdown on outside click
    useEffect(() => {
        function handler(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <section className="panel">
            <h2>
                <span className="panel-step">1</span> Select Location
            </h2>
            <div className="location-autocomplete" ref={containerRef}>
                <div className="input-icon-wrap">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                    <input
                        type="text"
                        id="location-input"
                        value={value}
                        onChange={handleInput}
                        onFocus={() => {
                            if (suggestions.length > 0) setOpen(true);
                        }}
                        placeholder="City name, e.g. Tokyo or London"
                        autoComplete="off"
                        aria-label="Location"
                        aria-autocomplete="list"
                        aria-expanded={open}
                    />
                </div>
                {open && (
                    <ul className="autocomplete-list" role="listbox">
                        {suggestions.map((s) => (
                            <li key={s} role="option" onMouseDown={() => pick(s)}>
                                <svg viewBox="0 0 24 24" fill="none" style={{ width: 14, marginRight: 6, opacity: 0.6 }}>
                                    <circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" fill="none" />
                                </svg>
                                {s}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {resolvedName && (
                <p className="resolved-location">
                    <span className="resolved-dot" /> Resolved to: <strong>{resolvedName}</strong>
                </p>
            )}
            <p className="hint">Type a city name or pick from suggestions. Unknown cities use OpenStreetMap geocoding.</p>
        </section>
    );
}
