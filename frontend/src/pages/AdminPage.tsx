import { useState, type FormEvent } from 'react'
import { apiUrl } from '../api'
import AdminContentEditors from '../components/AdminContentEditors'
import SectionHeading from '../components/SectionHeading'
import StatusBanner from '../components/StatusBanner'
import { useLocale } from '../i18n/LocaleContext'

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

export default function AdminPage() {
  const { locale, ui } = useLocale()
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
        if (res.status === 401 || res.status === 403) {
          setError(ui.admin.authError)
        } else {
          setError(
            locale === 'fr'
              ? `Impossible de charger les messages (HTTP ${res.status}).`
              : `Could not load messages (HTTP ${res.status}).`,
          )
        }
        return false
      }

      const data: ContactMessage[] = await res.json()
      setMessages(data)
      setAuthenticated(true)
      return true
    } catch {
      setError(ui.admin.unreachable)
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
      <SectionHeading title={ui.admin.title} index="AD" />
      <p className="contact-blurb contact-blurb--tight">
        {authenticated ? ui.admin.signedIn : ui.admin.signedOut}
      </p>

      {!authenticated && (
        <form className="mt-2 max-w-md space-y-5" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">{ui.admin.username}</span>
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
            <span className="field-label">{ui.admin.password}</span>
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
            {loading ? ui.admin.loading : ui.admin.load}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-6">
          <StatusBanner tone="error" role="alert">
            {error}
          </StatusBanner>
        </div>
      )}

      {authenticated && (
        <div className="mt-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? ui.admin.refreshing : ui.admin.refresh}
          </button>

          <AdminContentEditors authHeader={basicAuthHeader(username, password)} />

          <div className="mt-10">
            <h2 className="section-label">{ui.admin.listHeading}</h2>
            {messages == null ? null : messages.length === 0 ? (
              <p className="prose-quiet">{ui.admin.empty}</p>
            ) : (
              <ul className="mt-4 space-y-6">
                {messages.map((msg) => (
                  <li key={msg.id} className="border border-line bg-surface p-5">
                    <p className="font-semibold text-ink">
                      {msg.name}{' '}
                      <span className="font-normal text-muted">· {msg.email}</span>
                    </p>
                    <p className="mt-1 font-mono text-xs tracking-wide text-muted">
                      {new Date(msg.createdAt).toLocaleString(locale)}
                    </p>
                    <p className="mt-3 prose-quiet">{msg.message}</p>
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
