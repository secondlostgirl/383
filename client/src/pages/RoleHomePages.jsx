import { useAuth } from '../auth/authContext.js'

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

export function SpecialistHomePage() {
  const { user } = useAuth()
  return (
    <section>
      <h1>Specialist dashboard</h1>
      <p>Welcome, {user.name}.</p>
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
