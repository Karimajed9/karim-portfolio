import { useState, type FormEvent } from 'react'
import { apiUrl } from '../api'
import AdminContentEditors, {
  type AdminEditorPanel,
} from '../components/AdminContentEditors'
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

type AdminTab = 'messages' | AdminEditorPanel

export default function AdminPage() {
  const { locale, ui } = useLocale()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [messages, setMessages] = useState<ContactMessage[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<AdminTab>('messages')
  const [contentReloadToken, setContentReloadToken] = useState(0)

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'messages', label: ui.admin.messagesTab },
    { id: 'experience', label: ui.admin.experienceHeading },
    { id: 'projects', label: ui.admin.projectsHeading },
    { id: 'skills', label: ui.admin.skillsHeading },
    { id: 'education', label: ui.admin.educationHeading },
    { id: 'cv', label: ui.admin.cvTab },
  ]

  async function fetchMessages() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(apiUrl('/api/admin/messages'), {
        credentials: 'include',
      })
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setAuthenticated(false)
          setCsrfToken(null)
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
    setError(null)
    setLoading(true)
    let signedIn = false
    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        setAuthenticated(false)
        setCsrfToken(null)
        if (res.status === 429) {
          setError(ui.admin.tooManyRequests)
        } else {
          setError(ui.admin.authError)
        }
        return
      }
      const data = (await res.json()) as { csrfToken?: string }
      if (!data.csrfToken) {
        setAuthenticated(false)
        setCsrfToken(null)
        setError(ui.admin.authError)
        return
      }
      setPassword('')
      setCsrfToken(data.csrfToken)
      setAuthenticated(true)
      setTab('messages')
      signedIn = true
    } catch {
      setError(ui.admin.unreachable)
      return
    } finally {
      setLoading(false)
    }
    if (signedIn) {
      await fetchMessages()
    }
  }

  async function handleRefresh() {
    if (tab === 'messages') {
      await fetchMessages()
      return
    }
    setContentReloadToken((n) => n + 1)
  }

  async function handleLogout() {
    setError(null)
    try {
      await fetch(apiUrl('/api/admin/logout'), {
        method: 'POST',
        credentials: 'include',
        headers: csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {},
      })
    } catch {
      // Session clear is best-effort.
    }
    setAuthenticated(false)
    setCsrfToken(null)
    setMessages(null)
    setPassword('')
    setTab('messages')
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

      {authenticated && csrfToken && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => void handleRefresh()}
              disabled={loading}
            >
              {loading ? ui.admin.refreshing : ui.admin.refresh}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>
              {ui.admin.logout}
            </button>
          </div>

          <div
            className="admin-tabs"
            role="tablist"
            aria-label={ui.admin.tabsLabel}
          >
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`admin-tab-${item.id}`}
                aria-selected={tab === item.id}
                aria-controls={`admin-panel-${item.id}`}
                className={`admin-tab${tab === item.id ? ' is-active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'messages' ? (
            <div
              className="mt-8"
              role="tabpanel"
              id="admin-panel-messages"
              aria-labelledby="admin-tab-messages"
            >
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
          ) : (
            <div
              role="tabpanel"
              id={`admin-panel-${tab}`}
              aria-labelledby={`admin-tab-${tab}`}
            >
              <AdminContentEditors
                csrfToken={csrfToken}
                panel={tab}
                reloadToken={contentReloadToken}
              />
            </div>
          )}
        </div>
      )}
    </section>
  )
}
