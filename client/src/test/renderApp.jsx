import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import App from '../App.jsx'
import AuthProvider from '../auth/AuthProvider.jsx'

export const USERS = {
  parent: { id: 1, name: 'Elif Demir', email: 'elif.parent@demo.test', role: 'parent' },
  specialist: { id: 5, name: 'Selin Arslan', email: 'selin.specialist@demo.test', role: 'specialist' },
  child: { id: 3, name: 'Deniz Demir', email: 'deniz.child@demo.test', role: 'child' },
}

function jsonResponse(body, status = 200) {
  // Like Express: no body and no Content-Type for e.g. 204 No Content
  if (body === undefined) return new Response(null, { status })
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Fake backend. routes: { 'POST /api/auth/login': (body) => [status, json], ... }
// Unknown routes answer 404. Returns the fetch mock to inspect calls.
export function mockApi(routes) {
  const fetchMock = vi.fn(async (url, options = {}) => {
    const key = `${options.method || 'GET'} ${url}`
    const handler = routes[key]
    if (!handler) return jsonResponse({ error: 'Not found' }, 404)
    const body = options.body ? JSON.parse(options.body) : undefined
    const [status, json] = await handler(body, options)
    return jsonResponse(json, status)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

// Signed in as `role`: a stored token and /api/auth/me returning that user.
export function signedInAs(role, extraRoutes = {}) {
  localStorage.setItem('token', `token-for-${role}`)
  return mockApi({
    'GET /api/auth/me': () => [200, { user: USERS[role] }],
    ...extraRoutes,
  })
}

export function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}
