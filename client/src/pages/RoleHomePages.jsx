import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client.js'
import { useAuth } from '../auth/authContext.js'
import { specialistTypeLabel } from '../constants.js'

// Home screen per role. Module pages (schedule, tasks, entries, ...) are
// added to these as M2–M8 are built.

export function ParentHomePage() {
  const { user } = useAuth()
  return (
    <section>
      <h1>Parent dashboard</h1>
      <p>Welcome, {user.name}.</p>
    </section>
  )
}

// M2: a specialist sees only the children they are linked to right now.
function MyChildren() {
  const [children, setChildren] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/me/children')
      .then((data) => setChildren(data.children))
      .catch(() => setError('Could not load your children.'))
  }, [])

  if (error) {
    return (
      <p className="alert alert-error" role="alert">
        {error}
      </p>
    )
  }
  if (children === null) return <p>Loading...</p>
  if (children.length === 0) {
    return <p>You are not linked to any child yet. A parent can link you using your email address.</p>
  }
  return (
    <ul className="list">
      {children.map((c) => (
        <li key={c.id}>
          <strong>{c.name}</strong> · born {c.birthDate} · you are linked as{' '}
          {specialistTypeLabel(c.specialistType).toLowerCase()}
        </li>
      ))}
    </ul>
  )
}

export function SpecialistHomePage() {
  const { user } = useAuth()
  return (
    <section className="stack">
      <h1>Specialist dashboard</h1>
      <p>Welcome, {user.name}.</p>
      <section className="card" aria-labelledby="my-children-heading">
        <h2 id="my-children-heading">My children</h2>
        <MyChildren />
      </section>
    </section>
  )
}

export function ChildHomePage() {
  const { user } = useAuth()
  return (
    <section>
      <h1>My page</h1>
      <p>Hello, {user.name}!</p>
    </section>
  )
}
