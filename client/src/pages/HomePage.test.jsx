import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HomePage from './HomePage.jsx'

function mockFetch(response) {
  vi.stubGlobal('fetch', vi.fn(response))
}

function renderPage() {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the API status returned by the backend', async () => {
    mockFetch(async () => new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
    renderPage()

    expect(screen.getByRole('heading', { name: /child development platform/i })).toBeInTheDocument()
    expect(await screen.findByText('API: ok')).toBeInTheDocument()
  })

  it('shows unreachable when the backend is down', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch')
    })
    renderPage()

    expect(await screen.findByText('API: unreachable')).toBeInTheDocument()
  })
})
