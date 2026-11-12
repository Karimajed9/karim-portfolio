import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { apiUrl } from '../api'
import { useLocale } from '../i18n/LocaleContext'

/** How often open tabs check for admin content changes. */
export const CONTENT_REVISION_POLL_MS = 20_000

/**
 * Dismissible “refresh for latest” notice when admin content changed after
 * this page view started. Does not auto-reload. Cleared only for this view
 * (component state) — a full reload shows fresh content without the banner.
 */
export default function ContentUpdateBanner() {
  const { ui } = useLocale()
  const location = useLocation()
  const baselineRef = useRef<number | null>(null)
  const [outdated, setOutdated] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const isAdmin = location.pathname.includes('/admin')

  useEffect(() => {
    if (isAdmin) return

    let cancelled = false

    async function poll() {
      try {
        const res = await fetch(apiUrl('/api/content-revision'))
        if (!res.ok || cancelled) return
        const data = (await res.json()) as { revision?: number }
        const revision = typeof data.revision === 'number' ? data.revision : null
        if (revision == null) return
        if (baselineRef.current == null) {
          baselineRef.current = revision
          return
        }
        if (revision !== baselineRef.current) {
          setOutdated(true)
        }
      } catch {
        // Offline / cold API — skip; other banners cover connectivity.
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

  if (isAdmin || dismissed || !outdated) return null

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
