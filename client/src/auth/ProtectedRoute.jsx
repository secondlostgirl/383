import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { homePathFor, useAuth } from './authContext.js'

// Layout route guard. Signed out → /login (remembering where the user wanted
// to go). Wrong role → the user's own home screen. Hiding screens is only for
// usability; the API enforces access on its own.
export default function ProtectedRoute({ roles }) {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <p className="page-status">Loading...</p>
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathFor(user.role)} replace />
  }
  return <Outlet />
}
