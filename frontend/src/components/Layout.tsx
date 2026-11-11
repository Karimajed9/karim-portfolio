import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { site } from '../data/site'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/skills', label: 'Skills' },
  { to: '/experience', label: 'Experience' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
] as const

export default function Layout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  // Close the menu when the path changes without setState-in-effect and
  // without unmounting the clicked NavLink mid-navigation.
  const [menuPath, setMenuPath] = useState(location.pathname)
  const menuId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

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
        Skip to content
      </a>
      <nav className="site-nav" aria-label="Primary">
        <NavLink to="/" className="site-brand" end>
          <span className="site-brand-mark" aria-hidden="true">
            KM
          </span>
          <span className="site-brand-name">{site.name}</span>
        </NavLink>

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

        <button
          ref={toggleRef}
          type="button"
          className="site-nav-toggle"
          aria-expanded={isMenuOpen}
          aria-controls={menuId}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={toggleMenu}
        >
          <span className="site-nav-toggle-bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </nav>

      {isMenuOpen ? (
        <div id={menuId} className="site-nav-mobile" role="dialog" aria-modal="true" aria-label="Site menu">
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

      {/* No pathname key / page-enter wrapper — remount+transition compounded the flash. */}
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
                GitHub
              </a>
              <a href={site.linkedInUrl} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>
          </div>
          <p className="site-footer-copy">Portfolio · Montreal</p>
        </div>
      </footer>
    </div>
  )
}
