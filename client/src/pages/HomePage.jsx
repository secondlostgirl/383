import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client.js'

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState('checking...')

  useEffect(() => {
    apiFetch('/health')
      .then((data) => setApiStatus(data.status))
      .catch(() => setApiStatus('unreachable'))
  }, [])

  return (
    <main>
      <h1>Child Development Platform</h1>
      <p>API: {apiStatus}</p>
    </main>
  )
}
