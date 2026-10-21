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
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    throw new ApiError(data?.error || response.statusText, response.status)
  }
  return data
}
