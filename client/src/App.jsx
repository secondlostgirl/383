import { Navigate, Route, Routes } from 'react-router-dom'
import { homePathFor, useAuth } from './auth/authContext.js'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import AppLayout from './components/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import LinkedSpecialistsPage from './pages/parent/LinkedSpecialistsPage.jsx'
import { ChildHomePage, ParentHomePage, SpecialistHomePage } from './pages/RoleHomePages.jsx'

// "/" sends signed-in users to their own home screen
function RootRedirect() {
  const { user, status } = useAuth()
  if (status === 'loading') return <p className="page-status">Loading...</p>
  return <Navigate to={user ? homePathFor(user.role) : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute roles={['parent']} />}>
            <Route path="/parent" element={<ParentHomePage />} />
            <Route path="/parent/specialists" element={<LinkedSpecialistsPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={['specialist']} />}>
            <Route path="/specialist" element={<SpecialistHomePage />} />
          </Route>
          <Route element={<ProtectedRoute roles={['child']} />}>
            <Route path="/child" element={<ChildHomePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
