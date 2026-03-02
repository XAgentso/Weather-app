import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

// ── Mock the API modules ───────────────────────────────────────────────────
vi.mock('./api/geocoding.js', () => ({
  resolveLocation: vi.fn(),
  getPresetNames: vi.fn(() => ['New York, USA', 'London, UK', 'Mumbai, India']),
}))

vi.mock('./api/nasaPower.js', () => ({
  fetchDailyClimatology: vi.fn(),
  dateToDayOfYear: vi.fn(() => 196), // roughly July 15
}))

// ── Mock react-leaflet (avoid real DOM map in tests) ───────────────────────
// NOTE: All values must be defined inside the vi.mock factory; Vitest hoists
// vi.mock() calls and outer-scope variables are not accessible.
vi.mock('react-leaflet', () => {
  const LayersControl = Object.assign(
    ({ children }) => children,
    {
      BaseLayer: ({ children }) => children,
      Overlay: ({ children }) => children,
    },
  )
  return {
    MapContainer: ({ children }) => children,
    TileLayer: () => null,
    WMSTileLayer: () => null,
    LayersControl,
    useMap: () => ({ flyTo: () => { } }),
  }
})

// ── Import mocked modules for assertion ───────────────────────────────────
import { resolveLocation } from './api/geocoding.js'
import { fetchDailyClimatology } from './api/nasaPower.js'

// ── Stub result data ──────────────────────────────────────────────────────
const STUB_GEO = { lat: 19.076, lon: 72.877, displayName: 'Mumbai, India' }
const STUB_RESULTS = {
  summary: 'Based on 30 years of climate data for Mumbai, India.',
  entries: [
    { label: 'Very hot ≥ 32°C (90°F)', probability: 78, icon: 'hot', color: '#ff6b35' },
    { label: 'Very wet ≥ 10 mm/day', probability: 42, icon: 'wet', color: '#4dabf7' },
  ],
  location: STUB_GEO,
  dayOfYear: 196,
  yearsAnalysed: 30,
  daysAnalysed: 450,
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders heading and has disabled compute button initially', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /weather likelihood dashboard/i }),
    ).toBeInTheDocument()

    const button = screen.getByRole('button', { name: /compute likelihood/i })
    expect(button).toBeDisabled()
  })

  it('enables compute button when location and date are filled', async () => {
    const user = userEvent.setup()
    render(<App />)

    const locationInput = screen.getByLabelText(/location/i)
    const dateInput = screen.getByLabelText(/date/i)

    await user.type(locationInput, 'Mumbai')
    fireEvent.change(dateInput, { target: { value: '2025-07-15' } })

    const button = screen.getByRole('button', { name: /compute likelihood/i })
    expect(button).not.toBeDisabled()
  })

  it('shows results after successful compute', async () => {
    resolveLocation.mockResolvedValue(STUB_GEO)
    fetchDailyClimatology.mockResolvedValue(STUB_RESULTS)

    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/location/i), 'Mumbai')
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2025-07-15' } })

    await user.click(screen.getByRole('button', { name: /compute likelihood/i }))

    await waitFor(() => {
      // Full label as set in STUB_RESULTS entries – unique to the results panel
      expect(screen.getByText(/Very hot ≥ 32°C/)).toBeInTheDocument()
    })

    expect(screen.getByText(/78%/)).toBeInTheDocument()
    expect(screen.getByText(/42%/)).toBeInTheDocument()
    expect(screen.getByText(/Based on 30 years/i)).toBeInTheDocument()
  })

  it('shows error message when geocoding fails', async () => {
    resolveLocation.mockRejectedValue(
      new Error('Location "xyz123" not found. Try a major city name.'),
    )

    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/location/i), 'xyz123')
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2025-07-15' } })

    await user.click(screen.getByRole('button', { name: /compute likelihood/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    expect(screen.getByRole('alert')).toHaveTextContent(/not found/i)
  })

  it('shows error message when NASA POWER API fails', async () => {
    resolveLocation.mockResolvedValue(STUB_GEO)
    fetchDailyClimatology.mockRejectedValue(
      new Error('NASA POWER API returned HTTP 503.'),
    )

    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/location/i), 'Mumbai')
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2025-07-15' } })

    await user.click(screen.getByRole('button', { name: /compute likelihood/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    expect(screen.getByRole('alert')).toHaveTextContent(/503/i)
  })

  it('switches to radar map tab', async () => {
    const user = userEvent.setup()
    render(<App />)

    const radarTab = screen.getByRole('tab', { name: /radar map/i })
    await user.click(radarTab)

    // The radar panel should now be visible
    expect(screen.getByText(/weather radar map/i)).toBeVisible()
  })
})
