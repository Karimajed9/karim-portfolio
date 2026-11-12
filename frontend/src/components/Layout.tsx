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
  const menuId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)

  const isHome = location.pathname === '/' || location.pathname === ''
  const isMenuOpen = menuOpen && isHome

  useEffect(() => {
    if (!isMenuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isMenuOpen])

  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link">
        {ui.skipToContent}
      </a>
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="site-brand" onClick={() => setMenuOpen(false)}>
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
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span aria-hidden="true">{isMenuOpen ? '×' : '☰'}</span>
              </button>
            ) : null}
          </div>
        </div>

        {isMenuOpen ? (
          <nav
            id={menuId}
            className="mobile-sections page-frame"
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
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
        ) : null}
      </header>

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
