import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HomePage from './HomePage.jsx'

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// routes: { '/api/health': () => Response, '/api/tasks': () => Response }
function mockFetch(routes) {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    const handler = routes[url]
    if (!handler) throw new TypeError('Failed to fetch')
    return handler()
  }))
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
    mockFetch({
      '/api/health': () => jsonResponse({ status: 'ok' }),
      '/api/tasks': () => jsonResponse({ tasks: [] }),
    })
    renderPage()

    expect(screen.getByRole('heading', { name: /child development platform/i })).toBeInTheDocument()
    expect(await screen.findByText('API: ok')).toBeInTheDocument()
  })

  it('shows unreachable when the backend is down', async () => {
    mockFetch({})
    renderPage()

    expect(await screen.findByText('API: unreachable')).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load tasks.')
  })

  it('lists the tasks returned by the API', async () => {
    mockFetch({
      '/api/health': () => jsonResponse({ status: 'ok' }),
      '/api/tasks': () => jsonResponse({
        tasks: [{ id: 1, title: 'Read a picture book for 15 minutes', status: 'pending' }],
      }),
    })
    renderPage()

    expect(await screen.findByRole('listitem')).toHaveTextContent('Read a picture book for 15 minutes (pending)')
  })

  it('shows an empty state when there are no tasks', async () => {
    mockFetch({
      '/api/health': () => jsonResponse({ status: 'ok' }),
      '/api/tasks': () => jsonResponse({ tasks: [] }),
    })
    renderPage()

    expect(await screen.findByText('No tasks yet.')).toBeInTheDocument()
  })
})
