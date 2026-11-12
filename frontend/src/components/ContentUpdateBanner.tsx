import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  apiUrl,
  fallbackReasonFromHealth,
  probeApiHealth,
} from '../api'
import { reportApiDown, reportApiUp } from '../lib/apiBannerState'
import { useLocale } from '../i18n/LocaleContext'

/** How often open tabs check for admin content changes. */
export const CONTENT_REVISION_POLL_MS = 20_000

/**
 * Dismissible “refresh for latest” notice when admin content changed after
 * this page view started. Does not auto-reload.
 *
 * Polling is public-site only: the admin route never hits `/api/content-revision`
 * (edits there would keep triggering the notice). Failed polls report the shared
 * offline API banner. A successful poll (HTTP 200) clears that banner —
 * including recovery after an earlier failure. Empty revision payloads stay quiet
 * for the update notice but still clear offline.
 */
export default function ContentUpdateBanner() {
  const { ui } = useLocale()
  const location = useLocation()
  const baselineRef = useRef<number | null>(null)
  const [outdated, setOutdated] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const isAdmin =
    location.pathname === '/admin' || location.pathname.endsWith('/admin')

  useEffect(() => {
    // Admin editors bump the revision themselves — do not poll while editing.
    if (isAdmin) return

    let cancelled = false
    let pollSeq = 0

    async function markUnreachable(seq: number) {
      const health = await probeApiHealth()
      if (cancelled || seq !== pollSeq) return
      reportApiDown(fallbackReasonFromHealth(health))
      setOutdated(false)
    }

    async function poll() {
      const seq = ++pollSeq
      try {
        const res = await fetch(apiUrl('/api/content-revision'))
        if (cancelled || seq !== pollSeq) return
        if (!res.ok) {
          await markUnreachable(seq)
          return
        }
        const data = (await res.json()) as { revision?: number }
        if (cancelled || seq !== pollSeq) return

        // Any successful content-revision clears offline/warming banners.
        reportApiUp()

        const revision = typeof data.revision === 'number' ? data.revision : null
        // Empty body: offline cleared above; no “content updated” notice.
        if (revision == null) return

        if (baselineRef.current == null) {
          baselineRef.current = revision
          return
        }
        if (revision !== baselineRef.current) {
          setOutdated(true)
        }
      } catch {
        if (!cancelled && seq === pollSeq) {
          await markUnreachable(seq)
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
