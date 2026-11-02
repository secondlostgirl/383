import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client.js'

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState('checking...')
  const [tasks, setTasks] = useState(null)
  const [tasksError, setTasksError] = useState(false)

  useEffect(() => {
    apiFetch('/health')
      .then((data) => setApiStatus(data.status))
      .catch(() => setApiStatus('unreachable'))

    // Walking skeleton (M4-01): show tasks stored in SQLite
    apiFetch('/tasks')
      .then((data) => setTasks(data.tasks))
      .catch(() => setTasksError(true))
  }, [])

  return (
    <main>
      <h1>Child Development Platform</h1>
      <p>API: {apiStatus}</p>

      <section aria-labelledby="tasks-heading">
        <h2 id="tasks-heading">Tasks</h2>
        {tasksError && <p role="alert">Could not load tasks.</p>}
        {!tasksError && tasks === null && <p>Loading tasks...</p>}
        {tasks?.length === 0 && <p>No tasks yet.</p>}
        {tasks?.length > 0 && (
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                {task.title} ({task.status})
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
