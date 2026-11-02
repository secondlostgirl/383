import { useState } from 'react'
import { apiFetch } from '../../api/client.js'
import { SPECIALIST_TYPES } from '../../constants.js'

// M2: the parent links a registered specialist to a child by email and type.
export default function LinkSpecialistForm({ child, onLinked }) {
  const [email, setEmail] = useState('')
  const [specialistType, setSpecialistType] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const errors = {}
    if (!email.trim()) errors.email = 'Enter the specialist\'s email.'
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Enter a valid email address.'
    if (!specialistType) errors.specialistType = 'Choose the specialist type.'
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
      const { specialist } = await apiFetch(`/children/${child.id}/specialists`, {
        method: 'POST',
        body: { email: email.trim(), specialistType },
      })
      setEmail('')
      setSpecialistType('')
      onLinked(specialist)
    } catch (err) {
      if (err.status === 404) {
        setError('No registered specialist uses this email. Ask them to create an account first.')
      } else if (err.status === 409) {
        setError(`This specialist is already linked to ${child.name}.`)
      } else {
        setError('Could not link the specialist. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate aria-labelledby="link-heading">
      <h2 id="link-heading">Link a specialist</h2>

      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-row">
        <div className="field">
          <label htmlFor="specialist-email">Specialist email</label>
          <input
            id="specialist-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'specialist-email-error' : undefined}
          />
          {fieldErrors.email && (
            <span id="specialist-email-error" className="field-error">
              {fieldErrors.email}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="specialist-type">Specialist type</label>
          <select
            id="specialist-type"
            value={specialistType}
            onChange={(e) => setSpecialistType(e.target.value)}
            aria-invalid={Boolean(fieldErrors.specialistType)}
            aria-describedby={fieldErrors.specialistType ? 'specialist-type-error' : undefined}
          >
            <option value="">Choose...</option>
            {SPECIALIST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {fieldErrors.specialistType && (
            <span id="specialist-type-error" className="field-error">
              {fieldErrors.specialistType}
            </span>
          )}
        </div>
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Linking...' : 'Link specialist'}
      </button>
    </form>
  )
}
