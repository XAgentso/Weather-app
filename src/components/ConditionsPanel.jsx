/**
 * @fileoverview ConditionsPanel — toggle checkboxes for each weather condition.
 * Monochrome: the per-condition color values are kept for data purposes only
 * (passed to WeatherIcon for future use) but are NOT applied as inline styles.
 * All active/hover treatment is handled purely through CSS classes.
 */

import WeatherIcon from './WeatherIcon.jsx';

const CONDITIONS = [
    {
        key: 'veryHot',
        icon: 'hot',
        label: 'Very hot',
        description: '≥ 32°C / 90°F',
    },
    {
        key: 'veryCold',
        icon: 'cold',
        label: 'Very cold',
        description: '≤ 0°C / 32°F',
    },
    {
        key: 'veryWindy',
        icon: 'wind',
        label: 'Very windy',
        description: '≥ 11 m/s / 25 mph',
    },
    {
        key: 'veryWet',
        icon: 'wet',
        label: 'Very wet',
        description: '≥ 10 mm/day',
    },
    {
        key: 'veryUncomfortable',
        icon: 'uncomfortable',
        label: 'Very uncomfortable',
        description: 'Hot + humid',
    },
];

/**
 * @param {{
 *   variables: Record<string, boolean>,
 *   onToggle: (key: string) => void,
 * }} props
 */
export default function ConditionsPanel({ variables, onToggle }) {
    return (
        <section className="panel">
            <h2>
                <span className="panel-step">3</span> Weather Conditions
            </h2>
            <div className="conditions-grid">
                {CONDITIONS.map(({ key, icon, label, description }) => (
                    <label
                        key={key}
                        className={`condition-chip ${variables[key] ? 'condition-chip--active' : ''}`}
                    >
                        <input
                            type="checkbox"
                            checked={variables[key]}
                            onChange={() => onToggle(key)}
                            className="condition-checkbox"
                        />
                        <span className="condition-icon">
                            <WeatherIcon type={icon} size={22} />
                        </span>
                        <span className="condition-text">
                            <span className="condition-label">{label}</span>
                            <span className="condition-desc">{description}</span>
                        </span>
                    </label>
                ))}
            </div>
        </section>
    );
}
