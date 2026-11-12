import { useState, type FormEvent } from 'react'
import { apiUrl } from '../api'
import { adminAuthHeaders, readAdminLoginFields } from '../lib/adminSession'
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

type MessagesPage = {
  content: ContactMessage[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

type AdminTab = 'messages' | AdminEditorPanel

const MESSAGES_PAGE_SIZE = 20

export default function AdminPage() {
  const { locale, ui } = useLocale()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [messages, setMessages] = useState<ContactMessage[] | null>(null)
  const [messagePage, setMessagePage] = useState(0)
  const [messageTotalPages, setMessageTotalPages] = useState(0)
  const [messageTotal, setMessageTotal] = useState(0)
  const [deletingId, setDeletingId] = useState<number | null>(null)
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

  async function fetchMessages(
    page = messagePage,
    token: string | null = sessionToken,
    afterLogin = false,
  ) {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(
        apiUrl(`/api/admin/messages?page=${page}&size=${MESSAGES_PAGE_SIZE}`),
        {
          credentials: 'include',
          headers: adminAuthHeaders(null, token),
        },
      )
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setAuthenticated(false)
          setCsrfToken(null)
          setSessionToken(null)
          // Login can return 200 while Safari drops the session cookie. That
          // follow-up 401 is not a wrong password.
          setError(afterLogin ? ui.admin.sessionError : ui.admin.authError)
        } else {
          setError(
            locale === 'fr'
              ? `Impossible de charger les messages (HTTP ${res.status}).`
              : `Could not load messages (HTTP ${res.status}).`,
          )
        }
        return false
      }
      const data = (await res.json()) as MessagesPage
      setMessages(data.content ?? [])
      setMessagePage(data.number ?? page)
      setMessageTotalPages(Math.max(data.totalPages ?? 0, 0))
      setMessageTotal(data.totalElements ?? 0)
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
    const { username: submittedUser, password: submittedPass } = readAdminLoginFields(e.currentTarget)
    setUsername(submittedUser)
    setPassword(submittedPass)
    setMessages(null)
    setError(null)
    setLoading(true)
    let signedIn = false
    let issuedToken: string | null = null
    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: submittedUser, password: submittedPass }),
      })
      if (!res.ok) {
        setAuthenticated(false)
        setCsrfToken(null)
        setSessionToken(null)
        if (res.status === 429) {
          setError(ui.admin.tooManyRequests)
        } else {
          setError(ui.admin.authError)
        }
        return
      }
      const data = (await res.json()) as { csrfToken?: string; sessionToken?: string }
      if (!data.csrfToken) {
        setAuthenticated(false)
        setCsrfToken(null)
        setSessionToken(null)
        setError(ui.admin.authError)
        return
      }
      issuedToken = data.sessionToken ?? null
      setPassword('')
      setCsrfToken(data.csrfToken)
      setSessionToken(issuedToken)
      setAuthenticated(true)
      setTab('messages')
      setMessagePage(0)
      signedIn = true
    } catch {
      setError(ui.admin.unreachable)
      return
    } finally {
      setLoading(false)
    }
    if (signedIn) {
      await fetchMessages(0, issuedToken, true)
    }
  }

  async function handleRefresh() {
    if (tab === 'messages') {
      await fetchMessages(messagePage)
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
        headers: adminAuthHeaders(csrfToken, sessionToken),
      })
    } catch {
      // Session clear is best-effort.
    }
    setAuthenticated(false)
    setCsrfToken(null)
    setSessionToken(null)
    setMessages(null)
    setMessagePage(0)
    setMessageTotalPages(0)
    setMessageTotal(0)
    setPassword('')
    setTab('messages')
  }

  async function handleDeleteMessage(id: number) {
    if (!csrfToken) return
    setError(null)
    setDeletingId(id)
    try {
      const res = await fetch(apiUrl(`/api/admin/messages/${id}`), {
        method: 'DELETE',
        credentials: 'include',
        headers: adminAuthHeaders(csrfToken, sessionToken),
      })
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setAuthenticated(false)
          setCsrfToken(null)
          setSessionToken(null)
          setError(ui.admin.authError)
        } else {
          setError(ui.admin.deleteMessageFailed)
        }
        return
      }
      const nextPage =
        messages?.length === 1 && messagePage > 0 ? messagePage - 1 : messagePage
      await fetchMessages(nextPage)
    } catch {
      setError(ui.admin.unreachable)
    } finally {
      setDeletingId(null)
    }
  }

  const pageLabel = ui.admin.pageStatus
    .replace('{page}', String(messagePage + 1))
    .replace('{total}', String(Math.max(messageTotalPages, 1)))

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
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
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
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
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
                <>
                  <ul className="mt-4 space-y-6">
                    {messages.map((msg) => (
                      <li key={msg.id} className="border border-line bg-surface p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-ink">
                              {msg.name}{' '}
                              <span className="font-normal text-muted">· {msg.email}</span>
                            </p>
                            <p className="mt-1 font-mono text-xs tracking-wide text-muted">
                              {new Date(msg.createdAt).toLocaleString(locale)}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={deletingId === msg.id || loading}
                            onClick={() => void handleDeleteMessage(msg.id)}
                          >
                            {deletingId === msg.id
                              ? ui.admin.deletingMessage
                              : ui.admin.deleteMessage}
                          </button>
                        </div>
                        <p className="mt-3 prose-quiet">{msg.message}</p>
                      </li>
                    ))}
                  </ul>
                  {messageTotalPages > 1 ? (
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={loading || messagePage <= 0}
                        onClick={() => void fetchMessages(messagePage - 1)}
                      >
                        {ui.admin.prevPage}
                      </button>
                      <p className="font-mono text-xs tracking-wide text-muted">
                        {pageLabel}
                        {messageTotal > 0
                          ? ` · ${messageTotal} ${ui.admin.messagesCount}`
                          : null}
                      </p>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={loading || messagePage + 1 >= messageTotalPages}
                        onClick={() => void fetchMessages(messagePage + 1)}
                      >
                        {ui.admin.nextPage}
                      </button>
                    </div>
                  ) : messageTotal > 0 ? (
                    <p className="mt-4 font-mono text-xs tracking-wide text-muted">
                      {messageTotal} {ui.admin.messagesCount}
                    </p>
                  ) : null}
                </>
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
                sessionToken={sessionToken}
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
