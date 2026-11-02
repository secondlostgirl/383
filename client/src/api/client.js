const BASE_URL = '/api'
const TOKEN_KEY = 'token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

// Called when the API rejects our token (expired, account deleted, ...).
// AuthProvider registers a handler that signs the user out.
let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Thin wrapper around fetch: adds the JWT, sends/parses JSON and turns
// non-2xx responses into an ApiError with the HTTP status.
export async function apiFetch(path, { body, headers, ...options } = {}) {
  const token = getToken()
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  // 204 No Content (e.g. DELETE) has no body to parse
  const data = isJson && response.status !== 204 ? await response.json() : null

  if (!response.ok) {
    // A 401 while we sent a token means the session is over
    if (response.status === 401 && token) {
      setToken(null)
      unauthorizedHandler?.()
    }
    throw new ApiError(data?.error || response.statusText, response.status)
  }
  return data
}
