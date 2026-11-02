import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client.js'
import LinkSpecialistForm from './LinkSpecialistForm.jsx'

// M2 – parent: link specialists to a child (assignment Appendix A.6).
export default function LinkedSpecialistsPage() {
  const [children, setChildren] = useState(null)
  const [childId, setChildId] = useState('')
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    apiFetch('/me/children')
      .then((data) => {
        setChildren(data.children)
        if (data.children.length > 0) setChildId(String(data.children[0].id))
      })
      .catch(() => setLoadError('Could not load your children. Please reload the page.'))
  }, [])

  const child = children?.find((c) => String(c.id) === childId)

  function handleLinked(specialist) {
    setNotice(`${specialist.name} is now linked to ${child.name}.`)
  }

  function handleChildChange(event) {
    setChildId(event.target.value)
    setNotice('')
  }

  if (loadError) {
    return (
      <p className="alert alert-error" role="alert">
        {loadError}
      </p>
    )
  }
  if (children === null) {
    return <p className="page-status">Loading...</p>
  }

  return (
    <section className="stack">
      <h1>Linked specialists</h1>

      {children.length === 0 && <p>You have no children registered yet.</p>}

      {children.length > 1 && (
        <div className="field narrow">
          <label htmlFor="child-select">Child</label>
          <select id="child-select" value={childId} onChange={handleChildChange}>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {notice && (
        <p className="alert alert-success" role="status">
          {notice}
        </p>
      )}

      {child && <LinkSpecialistForm key={child.id} child={child} onLinked={handleLinked} />}
    </section>
  )
}
