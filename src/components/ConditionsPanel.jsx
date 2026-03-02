/**
 * @fileoverview ConditionsPanel — toggle checkboxes for each weather condition.
 */

import WeatherIcon from './WeatherIcon.jsx';

const CONDITIONS = [
    {
        key: 'veryHot',
        icon: 'hot',
        label: 'Very hot',
        description: '≥ 32°C / 90°F',
        color: '#ff6b35',
    },
    {
        key: 'veryCold',
        icon: 'cold',
        label: 'Very cold',
        description: '≤ 0°C / 32°F',
        color: '#74c0fc',
    },
    {
        key: 'veryWindy',
        icon: 'wind',
        label: 'Very windy',
        description: '≥ 11 m/s / 25 mph',
        color: '#a9e34b',
    },
    {
        key: 'veryWet',
        icon: 'wet',
        label: 'Very wet',
        description: '≥ 10 mm/day',
        color: '#4dabf7',
    },
    {
        key: 'veryUncomfortable',
        icon: 'uncomfortable',
        label: 'Very uncomfortable',
        description: 'Hot + humid',
        color: '#da77f2',
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
                {CONDITIONS.map(({ key, icon, label, description, color }) => (
                    <label
                        key={key}
                        className={`condition-chip ${variables[key] ? 'condition-chip--active' : ''}`}
                        style={variables[key] ? { '--chip-color': color } : {}}
                    >
                        <input
                            type="checkbox"
                            checked={variables[key]}
                            onChange={() => onToggle(key)}
                            className="condition-checkbox"
                        />
                        <span className="condition-icon" style={{ color: variables[key] ? color : undefined }}>
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
