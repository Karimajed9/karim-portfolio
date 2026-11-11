import { useEffect, useId, useRef, useState } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { useTheme } from '../theme/ThemeContext'

export default function SettingsMenu() {
  const { locale, setLocale, ui } = useLocale()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const titleId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const firstControlRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    firstControlRef.current?.focus()

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="settings-menu">
      <button
        ref={buttonRef}
        type="button"
        className="settings-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-label={ui.settings.open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          className="settings-trigger-icon"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.1 7.1 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.59.24-1.13.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 14.5a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.68.22l2.39-.96c.5.39 1.04.7 1.63.94l.36 2.54c.05.24.25.42.49.42h3.8c.24 0 .44-.18.49-.42l.36-2.54c.59-.24 1.13-.55 1.63-.94l2.39.96c.25.12.54.02.68-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
          />
        </svg>
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className="settings-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <p id={titleId} className="settings-panel-title">
            {ui.settings.title}
          </p>

          <div className="settings-group">
            <p className="settings-group-label" id={`${panelId}-theme`}>
              {ui.settings.theme}
            </p>
            <div
              className="settings-segment"
              role="group"
              aria-labelledby={`${panelId}-theme`}
            >
              <button
                ref={firstControlRef}
                type="button"
                className={`settings-segment-btn${theme === 'dark' ? ' is-active' : ''}`}
                aria-pressed={theme === 'dark'}
                onClick={() => setTheme('dark')}
              >
                {ui.settings.dark}
              </button>
              <button
                type="button"
                className={`settings-segment-btn${theme === 'light' ? ' is-active' : ''}`}
                aria-pressed={theme === 'light'}
                onClick={() => setTheme('light')}
              >
                {ui.settings.light}
              </button>
            </div>
          </div>

          <div className="settings-group">
            <p className="settings-group-label" id={`${panelId}-language`}>
              {ui.settings.language}
            </p>
            <div
              className="settings-segment"
              role="group"
              aria-labelledby={`${panelId}-language`}
            >
              <button
                type="button"
                className={`settings-segment-btn${locale === 'en' ? ' is-active' : ''}`}
                aria-pressed={locale === 'en'}
                onClick={() => setLocale('en')}
              >
                {ui.settings.english}
              </button>
              <button
                type="button"
                className={`settings-segment-btn${locale === 'fr' ? ' is-active' : ''}`}
                aria-pressed={locale === 'fr'}
                onClick={() => setLocale('fr')}
              >
                {ui.settings.french}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
