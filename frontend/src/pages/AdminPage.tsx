import { useState, type FormEvent } from 'react'
import { apiUrl } from '../api'
import PageHeader from '../components/PageHeader'

type ContactMessage = {
  id: number
  name: string
  email: string
  message: string
  createdAt: string
}

function basicAuthHeader(username: string, password: string): string {
  const token = btoa(`${username}:${password}`)
  return `Basic ${token}`
}

function errorMessageForStatus(status: number): string {
  if (status === 401 || status === 403) {
    return 'Invalid username or password.'
  }
  return `Could not load messages (HTTP ${status}).`
}

export default function AdminPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [messages, setMessages] = useState<ContactMessage[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchMessages(user: string, pass: string) {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(apiUrl('/api/admin/messages'), {
        headers: {
          Authorization: basicAuthHeader(user, pass),
        },
      })

      if (!res.ok) {
        setError(errorMessageForStatus(res.status))
        return false
      }

      const data: ContactMessage[] = await res.json()
      setMessages(data)
      setAuthenticated(true)
      return true
    } catch {
      setError('Could not reach the API. Is the backend running on port 8080?')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessages(null)
    await fetchMessages(username, password)
  }

  async function handleRefresh() {
    await fetchMessages(username, password)
  }

  return (
    <section className="page-wrap">
      <PageHeader
        title="Admin"
        subtitle={
          authenticated
            ? 'Contact messages from the site.'
            : 'Sign in to view contact messages.'
        }
      />

      {!authenticated && (
        <form className="mt-2 max-w-md space-y-5" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Username</span>
            <input
              type="text"
              name="username"
              autoComplete="username"
              className="field-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className="field-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading…' : 'Load messages'}
          </button>
        </form>
      )}

      {error && <p className="mt-6 text-red-600">{error}</p>}

      {authenticated && messages && (
        <div className="mt-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>

          <div className="mt-10">
            <h2 className="section-label">Contact messages</h2>
            {messages.length === 0 ? (
              <p className="prose-quiet">No messages yet.</p>
            ) : (
              <ul className="mt-4 space-y-6">
                {messages.map((msg) => (
                  <li key={msg.id} className="timeline-item">
                    <p className="font-semibold text-ink">
                      {msg.name}{' '}
                      <span className="font-normal text-muted">· {msg.email}</span>
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-2 prose-quiet">{msg.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
