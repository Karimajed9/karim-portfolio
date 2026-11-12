import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  apiUrl,
  fallbackReasonFromHealth,
  probeApiHealth,
  type ApiFallbackReason,
} from '../api'
import { useLocale } from '../i18n/LocaleContext'
import ApiFallbackBanner from './ApiFallbackBanner'

/** How often open tabs check for admin content changes. */
export const CONTENT_REVISION_POLL_MS = 20_000

/**
 * Dismissible “refresh for latest” notice when admin content changed after
 * this page view started. Does not auto-reload. Cleared only for this view
 * (component state) — a full reload shows fresh content without the banner.
 *
 * Failed polls (502, refused, network error) show the same offline API banner
 * as a failed experience/projects fetch. Empty/successful bodies stay quiet.
 */
export default function ContentUpdateBanner() {
  const { ui } = useLocale()
  const location = useLocation()
  const baselineRef = useRef<number | null>(null)
  const [outdated, setOutdated] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [connectivityReason, setConnectivityReason] = useState<ApiFallbackReason | null>(
    null,
  )

  const isAdmin =
    location.pathname === '/admin' || location.pathname.endsWith('/admin')

  useEffect(() => {
    if (isAdmin) return

    let cancelled = false

    async function markUnreachable() {
      const health = await probeApiHealth()
      if (cancelled) return
      setConnectivityReason(fallbackReasonFromHealth(health))
      setOutdated(false)
    }

    async function poll() {
      try {
        const res = await fetch(apiUrl('/api/content-revision'))
        if (cancelled) return
        if (!res.ok) {
          await markUnreachable()
          return
        }
        const data = (await res.json()) as { revision?: number }
        if (cancelled) return
        const revision = typeof data.revision === 'number' ? data.revision : null
        // Empty / malformed success body: stay quiet (not offline, not outdated).
        if (revision == null) return

        setConnectivityReason(null)
        if (baselineRef.current == null) {
          baselineRef.current = revision
          return
        }
        if (revision !== baselineRef.current) {
          setOutdated(true)
        }
      } catch {
        if (!cancelled) {
          await markUnreachable()
        }
      }
    }

    void poll()
    const timer = window.setInterval(() => void poll(), CONTENT_REVISION_POLL_MS)
    const onFocus = () => void poll()
    window.addEventListener('focus', onFocus)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [isAdmin])

  if (isAdmin) return null

  if (connectivityReason) {
    return <ApiFallbackBanner reason={connectivityReason} />
  }

  if (dismissed || !outdated) return null

  return (
    <div
      className="status-banner status-banner--overlay status-banner--dismissible"
      role="status"
    >
      <p className="status-banner-message">{ui.contentUpdate.message}</p>
      <button
        type="button"
        className="status-banner-dismiss"
        aria-label={ui.contentUpdate.dismiss}
        onClick={() => setDismissed(true)}
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  )
}
