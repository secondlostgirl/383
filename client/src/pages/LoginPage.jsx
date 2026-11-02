import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { homePathFor, useAuth } from '../auth/authContext.js'

// M1: email + password login. There is no role picker – the role comes
// from the account (assignment Appendix A.1).
export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={homePathFor(user.role)} replace />
  }

  function validate() {
    const errors = {}
    if (!email.trim()) errors.email = 'Enter your email.'
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Enter a valid email address.'
    if (!password) errors.password = 'Enter your password.'
    return errors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      const signedIn = await login(email.trim(), password)
      // Go back to the page that sent us here, if it belongs to this role
      const home = homePathFor(signedIn.role)
      const from = location.state?.from
      navigate(from && from.startsWith(home) ? from : home, { replace: true })
    } catch (err) {
      setError(err.status === 401 ? 'Invalid email or password.' : 'Could not sign in. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <h1>Child Development Platform</h1>
      <form className="card" onSubmit={handleSubmit} noValidate aria-labelledby="login-heading">
        <h2 id="login-heading">Sign in</h2>

        {error && (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        )}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email && (
            <span id="email-error" className="field-error">
              {fieldErrors.email}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
          />
          {fieldErrors.password && (
            <span id="password-error" className="field-error">
              {fieldErrors.password}
            </span>
          )}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
