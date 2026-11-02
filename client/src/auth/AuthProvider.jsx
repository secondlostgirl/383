import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch, getToken, setToken, setUnauthorizedHandler } from '../api/client.js'
import { AuthContext } from './authContext.js'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // With a stored token we first ask the API who we are
  const [status, setStatus] = useState(() => (getToken() ? 'loading' : 'ready'))

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    return () => setUnauthorizedHandler(null)
  }, [])

  useEffect(() => {
    if (!getToken()) return
    let active = true
    apiFetch('/auth/me')
      .then((data) => {
        if (active) setUser(data.user)
      })
      .catch(() => {
        // Expired or invalid token: start signed out
        setToken(null)
      })
      .finally(() => {
        if (active) setStatus('ready')
      })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
