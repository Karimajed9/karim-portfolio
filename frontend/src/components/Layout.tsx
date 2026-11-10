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

  return (
    <div className="site-shell">
      <nav className="site-nav" aria-label="Primary">
        <NavLink to="/" className="site-brand" end>
          <span className="site-brand-mark" aria-hidden="true">
            KM
          </span>
          <span className="site-brand-name">{site.name}</span>
        </NavLink>
        <div className="site-nav-links">
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
      </nav>
      <main key={location.pathname} className="site-main">
        <Outlet />
      </main>
    </div>
  )
}
