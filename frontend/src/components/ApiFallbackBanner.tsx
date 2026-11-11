import { useState } from 'react'
import type { ApiFallbackReason } from '../api'
import { useLocale } from '../i18n/LocaleContext'

type Props = {
  reason: ApiFallbackReason
}

/** Cleared only on full page reload — not written to localStorage/sessionStorage. */
let dismissedThisSession = false

export default function ApiFallbackBanner({ reason }: Props) {
  const { ui } = useLocale()
  const [, rerender] = useState(0)

  if (dismissedThisSession) return null

  const message =
    reason === 'warming'
      ? ui.apiBanner.warming
      : reason === 'offline'
        ? ui.apiBanner.offline
        : ui.apiBanner.loading

  return (
    <div
      className="status-banner status-banner--overlay status-banner--dismissible"
      role="status"
    >
      <p className="status-banner-message">{message}</p>
      <button
        type="button"
        className="status-banner-dismiss"
        aria-label={ui.apiBanner.dismiss}
        onClick={() => {
          dismissedThisSession = true
          rerender((n) => n + 1)
        }}
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  )
}
