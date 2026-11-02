import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

// { user, status: 'loading' | 'ready', login(email, password), logout() }
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}

// Each role has its own home screen; the role comes from the account.
const HOME_PATHS = {
  parent: '/parent',
  specialist: '/specialist',
  child: '/child',
}

export function homePathFor(role) {
  return HOME_PATHS[role] ?? '/login'
}
