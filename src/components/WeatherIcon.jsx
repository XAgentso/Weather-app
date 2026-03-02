/**
 * @fileoverview SVG weather condition icons.
 * Usage: <WeatherIcon type="hot" size={24} />
 * Types: "hot" | "cold" | "wind" | "wet" | "uncomfortable"
 */

const icons = {
    hot: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Sun */}
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    cold: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Snowflake */}
            <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <circle cx="12" cy="5" r="1.2" fill="currentColor" />
            <circle cx="12" cy="19" r="1.2" fill="currentColor" />
            <circle cx="5" cy="12" r="1.2" fill="currentColor" />
            <circle cx="19" cy="12" r="1.2" fill="currentColor" />
        </svg>
    ),
    wind: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Wind lines */}
            <path d="M3 8h11a3 3 0 1 0-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M3 12h14a3 3 0 1 1-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M3 16h8a2 2 0 1 0-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
    ),
    wet: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Cloud + rain drops */}
            <path d="M18 10h-.3A6 6 0 1 0 6.6 16H18a3 3 0 0 0 0-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
            <line x1="8" y1="19" x2="7" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="19" x2="11" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="19" x2="15" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    uncomfortable: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Sun + humidity water drop */}
            <circle cx="8" cy="10" r="3.5" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="8" y1="2" x2="8" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="16" x2="8" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="0" y1="10" x2="2" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M19 9l-2.5 5a2.5 2.5 0 0 0 5 0L19 9z" fill="currentColor" opacity="0.8" />
        </svg>
    ),
};

/**
 * Renders a weather icon SVG for the given condition type.
 *
 * @param {{ type: 'hot'|'cold'|'wind'|'wet'|'uncomfortable', size?: number, className?: string }} props
 */
export default function WeatherIcon({ type, size = 20, className = '' }) {
    const icon = icons[type] ?? icons.hot;
    return (
        <span
            className={`weather-icon weather-icon--${type} ${className}`}
            style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center' }}
        >
            {icon}
        </span>
    );
}
