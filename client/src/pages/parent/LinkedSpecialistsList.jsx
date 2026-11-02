import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { specialistTypeLabel } from '../../constants.js'

// M2: specialists currently linked to the child, with "Unlink" + confirmation.
// refreshKey changes after a new link so the list reloads.
export default function LinkedSpecialistsList({ child, refreshKey, onUnlinked }) {
  const [specialists, setSpecialists] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [pending, setPending] = useState(null) // specialist awaiting confirmation
  const [busy, setBusy] = useState(false)
  const [unlinkError, setUnlinkError] = useState('')

  useEffect(() => {
    let active = true
    setLoadError('')
    apiFetch(`/children/${child.id}/specialists`)
      .then((data) => {
        if (active) setSpecialists(data.specialists)
      })
      .catch(() => {
        if (active) setLoadError('Could not load the linked specialists.')
      })
    return () => {
      active = false
    }
  }, [child.id, refreshKey])

  async function confirmUnlink() {
    setBusy(true)
    setUnlinkError('')
    try {
      await apiFetch(`/children/${child.id}/specialists/${pending.id}`, { method: 'DELETE' })
      setSpecialists((list) => list.filter((s) => s.id !== pending.id))
      onUnlinked(pending)
      setPending(null)
    } catch {
      setUnlinkError(`Could not unlink ${pending.name}. Please try again.`)
      setPending(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card" aria-labelledby="linked-heading">
      <h2 id="linked-heading">Specialists linked to {child.name}</h2>

      {loadError && (
        <p className="alert alert-error" role="alert">
          {loadError}
        </p>
      )}
      {unlinkError && (
        <p className="alert alert-error" role="alert">
          {unlinkError}
        </p>
      )}
      {!loadError && specialists === null && <p>Loading...</p>}
      {specialists?.length === 0 && <p>No specialists are linked to {child.name} yet.</p>}

      {specialists?.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Type</th>
              <th scope="col">Linked since</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {specialists.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{specialistTypeLabel(s.specialistType)}</td>
                <td>{s.linkedAt.slice(0, 10)}</td>
                <td>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setPending(s)}
                    aria-label={`Unlink ${s.name}`}
                  >
                    Unlink
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pending && (
        <ConfirmDialog
          title={`Unlink ${pending.name}?`}
          message={`${pending.name} will immediately lose access to all of ${child.name}'s records.`}
          confirmLabel="Unlink"
          busy={busy}
          onConfirm={confirmUnlink}
          onCancel={() => setPending(null)}
        />
      )}
    </section>
  )
}
