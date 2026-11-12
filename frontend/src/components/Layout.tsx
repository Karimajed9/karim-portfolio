import { useEffect, useId, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext'
import { cvEnPath, cvFrPath } from '../lib/cv'
import ApiBannerHost from './ApiBannerHost'
import ContentUpdateBanner from './ContentUpdateBanner'
import SettingsMenu from './SettingsMenu'

export default function Layout() {
  const { site, ui } = useLocale()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPath, setMenuPath] = useState(location.pathname)
  const menuId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)

  if (location.pathname !== menuPath) {
    setMenuPath(location.pathname)
    setMenuOpen(false)
  }

  const isHome = location.pathname === '/' || location.pathname === ''
  const isMenuOpen = menuOpen && isHome && menuPath === location.pathname
  const panelRef = useRef<HTMLElement>(null)

  function closeMenu(restoreFocus = false) {
    document.documentElement.classList.remove('nav-menu-open')
    setMenuOpen(false)
    if (restoreFocus) toggleRef.current?.focus()
  }

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(min-width: 960px)')
    const onChange = () => {
      if (!mq.matches) return
      setMenuOpen(false)
      document.documentElement.classList.remove('nav-menu-open')
    }
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) {
      document.documentElement.classList.remove('nav-menu-open')
      return
    }

    document.documentElement.classList.add('nav-menu-open')
    const panel = panelRef.current
    const focusable = () =>
      panel
        ? Array.from(
            panel.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          )
        : []

    focusable()[0]?.focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        document.documentElement.classList.remove('nav-menu-open')
        setMenuOpen(false)
        toggleRef.current?.focus()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.documentElement.classList.remove('nav-menu-open')
    }
  }, [isMenuOpen])

  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link">
        {ui.skipToContent}
      </a>
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="site-brand" onClick={() => closeMenu(false)}>
            {site.name}
          </Link>

          <div className="site-header-actions">
            <nav className="site-header-nav" aria-label={ui.nav.primary}>
              <a href={site.linkedInUrl} target="_blank" rel="noreferrer">
                {ui.social.linkedIn} ↗
              </a>
              <a href={site.githubUrl} target="_blank" rel="noreferrer">
                {ui.social.github} ↗
              </a>
              <a href={cvEnPath} download>
                {ui.cv.en} ↓
              </a>
              <a href={cvFrPath} download>
                {ui.cv.fr} ↓
              </a>
              {isHome ? (
                <a href="#contact">{ui.sections.contact}</a>
              ) : (
                <Link to="/#contact">{ui.sections.contact}</Link>
              )}
            </nav>
            <SettingsMenu />
            {isHome ? (
              <button
                ref={toggleRef}
                type="button"
                className="settings-trigger mobile-menu-toggle"
                aria-expanded={isMenuOpen}
                aria-controls={menuId}
                aria-label={isMenuOpen ? ui.nav.closeMenu : ui.nav.openMenu}
                onClick={() => (isMenuOpen ? closeMenu(false) : setMenuOpen(true))}
              >
                <span aria-hidden="true">{isMenuOpen ? '×' : '☰'}</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {isMenuOpen ? (
        <div className="mobile-nav-layer">
          <div className="mobile-nav-backdrop" onClick={() => closeMenu(true)} />
          <nav
            ref={panelRef}
            id={menuId}
            className="mobile-nav-panel"
            aria-label={ui.nav.siteMenu}
          >
            {(
              [
                ['profile', ui.sections.profile],
                ['experience', ui.sections.experience],
                ['projects', ui.sections.projects],
                ['skills', ui.sections.skills],
                ['education', ui.sections.education],
                ['mobility', ui.sections.mobility],
                ['contact', ui.sections.contact],
              ] as const
            ).map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => closeMenu(false)}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}

      <ApiBannerHost />
      <ContentUpdateBanner />

      <main id="main-content" className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>{site.name}</span>
          <span>{ui.footer.location}</span>
        </div>
      </footer>
    </div>
  )
}
