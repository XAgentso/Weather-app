# NASA Weather Likelihood Dashboard

An interactive, data-driven climate dashboard that estimates the **historical probability** of weather conditions for any location and time of year — powered by **NASA POWER** climatology data and visualized on a live **NASA GIBS** satellite imagery map.

> **This is not a weather forecast.** It summarises 30 years of daily climate observations to answer: *"How often does this kind of weather happen here at this time of year?"*

---

## Features

- 🌡️ **Climatology probabilities** — very hot, cold, windy, wet, or uncomfortable — computed from 30 years of NASA POWER data (1991–2020 climate normals)
- 🌍 **Location autocomplete** — 20+ preset cities with OpenStreetMap Nominatim fallback (no API key needed)
- 🛰️ **Live satellite radar map** — NASA GIBS MODIS true-colour imagery overlay on Leaflet, with map fly-to on location resolve
- 📊 **Animated visual results** — colour-coded progress bars with qualitative descriptors (Rare → Very Likely)
- 📱 **Responsive design** — works on mobile and desktop

---

## Getting Started

```bash
npm install       # Install dependencies (includes leaflet, react-leaflet)
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build
npm run test      # Run Vitest test suite
npm run lint      # Run ESLint
```

No API keys or environment variables are required. All data sources are publicly accessible.

---

## Data Sources

| Source | Use | Key required? |
|---|---|---|
| [NASA POWER API](https://power.larc.nasa.gov/) | 30-year daily climatology (T2M_MAX, T2M_MIN, PRECTOTCORR, WS10M, RH2M) | ❌ No |
| [NASA GIBS](https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs) | Satellite map imagery (MODIS Terra/Aqua true colour) | ❌ No |
| [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) | Geocoding fallback for unknown city names | ❌ No |

### NASA POWER API details
- Endpoint: `https://power.larc.nasa.gov/api/temporal/daily/point`
- Community: `RE` (Renewable Energy)
- Date range: 1991-01-01 → 2020-12-31 (WMO 30-year standard climate normal)
- Seasonal window: ±7 days around the selected day-of-year (~450 daily samples over 30 years)

---

## Configuration

All tuneable constants live in [`src/config/weatherConfig.js`](src/config/weatherConfig.js):

```js
// Condition thresholds
HOT_THRESHOLD_C     = 32    // °C (≈ 90°F) for "very hot"
COLD_THRESHOLD_C    = 0     // °C for "very cold"
WIND_THRESHOLD_MS   = 11    // m/s (≈ 25 mph) for "very windy"
PRECIP_THRESHOLD_MM = 10    // mm/day for "very wet"
DISCOMFORT_TEMP_C   = 28    // °C  ┐ both must be met for
DISCOMFORT_RH_PCT   = 70    // %RH ┘ "very uncomfortable"

// Climatology window
CLIMATE_START_YEAR  = 1991
CLIMATE_END_YEAR    = 2020
DOY_WINDOW          = 7     // ±days around the selected date
```

Add cities to `LOCATION_PRESETS` in the same file for instant auto-complete without Nominatim.

---

## Architecture

```
src/
├── config/
│   └── weatherConfig.js      # All constants and location presets
├── api/
│   ├── nasaPower.js           # NASA POWER fetch + probability computation
│   ├── nasaPower.test.js      # Unit tests (fetch mocked)
│   └── geocoding.js           # Location name → lat/lon (preset + Nominatim)
├── components/
│   ├── LocationPanel.jsx      # City search with autocomplete
│   ├── DatePanel.jsx          # Date picker + day-of-year display
│   ├── ConditionsPanel.jsx    # Condition toggle chips
│   ├── ResultsPanel.jsx       # Probability bars + summary
│   ├── RadarMapPanel.jsx      # Leaflet map + NASA GIBS overlay
│   └── WeatherIcon.jsx        # SVG weather icons
├── App.jsx                    # Root: state, onCompute, tab routing
├── App.test.jsx               # Integration tests (API modules mocked)
├── App.css                    # Component styles
└── index.css                  # Global theme, tokens, reset
```

---

## Usage

1. **Select Location** — type a city name; pick from suggestions or let it geocode via OpenStreetMap
2. **Select Date** — choose any calendar date; the day-of-year is used to query seasonal climate
3. **Pick Conditions** — toggle which weather risks to estimate
4. **Compute Likelihood** — fetches 30 years of NASA data and shows probabilities as animated progress bars
5. **Radar Map tab** — shows live MODIS satellite imagery centred on your resolved location

---

## Roadmap

- [ ] Export results as CSV/JSON
- [ ] Multi-year trend overlay ("is it getting hotter?")
- [ ] Draw a region boundary for area-averaged statistics
- [ ] Confidence intervals / distribution visualisations
