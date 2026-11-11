import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext'
import SettingsMenu from './SettingsMenu'

export default function Layout() {
  const { site, ui } = useLocale()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPath, setMenuPath] = useState(location.pathname)
  const menuId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  const links = [
    { to: '/', label: ui.nav.home, end: true },
    { to: '/about', label: ui.nav.about },
    { to: '/skills', label: ui.nav.skills },
    { to: '/experience', label: ui.nav.experience },
    { to: '/projects', label: ui.nav.projects },
    { to: '/contact', label: ui.nav.contact },
  ] as const

  const isMenuOpen = menuOpen && menuPath === location.pathname

  useEffect(() => {
    if (!isMenuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    firstLinkRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isMenuOpen])

  function openMenu() {
    setMenuPath(location.pathname)
    setMenuOpen(true)
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  function toggleMenu() {
    if (isMenuOpen) closeMenu()
    else openMenu()
  }

  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link">
        {ui.skipToContent}
      </a>
      <nav className="site-nav" aria-label={ui.nav.primary}>
        <NavLink to="/" className="site-brand" end>
          <span className="site-brand-mark" aria-hidden="true">
            KM
          </span>
          <span className="site-brand-name">{site.name}</span>
        </NavLink>

        <div className="site-nav-end">
          <div className="site-nav-desktop">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={'end' in link ? link.end : false}
                className={({ isActive }) =>
                  `site-nav-link${isActive ? ' is-active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="site-nav-actions">
            <SettingsMenu />
            <button
              ref={toggleRef}
              type="button"
              className="site-nav-toggle"
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
              onClick={toggleMenu}
              aria-label={isMenuOpen ? ui.nav.closeMenu : ui.nav.openMenu}
            >
              <span className="site-nav-toggle-bars" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen ? (
        <div
          id={menuId}
          className="site-nav-mobile"
          role="dialog"
          aria-modal="true"
          aria-label={ui.nav.siteMenu}
        >
          {links.map((link, index) => (
            <NavLink
              key={link.to}
              ref={index === 0 ? firstLinkRef : undefined}
              to={link.to}
              end={'end' in link ? link.end : false}
              className={({ isActive }) =>
                `site-nav-link${isActive ? ' is-active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      ) : null}

      <main id="main-content" className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div>
            <p className="site-footer-brand">{site.name}</p>
            <p className="mt-1 text-sm text-ink-soft">{site.title}</p>
            <div className="site-footer-meta mt-4">
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              <a href={site.githubUrl} target="_blank" rel="noreferrer">
                {ui.social.github}
              </a>
              <a href={site.linkedInUrl} target="_blank" rel="noreferrer">
                {ui.social.linkedIn}
              </a>
            </div>
          </div>
          <p className="site-footer-copy">{ui.footer.location}</p>
        </div>
      </footer>
    </div>
  )
}
