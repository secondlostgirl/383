import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { homePathFor, useAuth } from '../auth/authContext.js'

const ROLE_LABELS = {
  parent: 'Parent',
  specialist: 'Specialist',
  child: 'Child',
}

// Navigation entries per role; later modules add their pages here.
const NAV_ITEMS = {
  parent: [{ to: '/parent', label: 'Home' }],
  specialist: [{ to: '/specialist', label: 'Home' }],
  child: [{ to: '/child', label: 'Home' }],
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className="app-header">
        <NavLink to={homePathFor(user.role)} className="app-title">
          Child Development Platform
        </NavLink>
        <nav aria-label="Main">
          {NAV_ITEMS[user.role].map((item) => (
            <NavLink key={item.to} to={item.to} end>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="app-user">
          <span>
            {user.name} · {ROLE_LABELS[user.role]}
          </span>
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}
