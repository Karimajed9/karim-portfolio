import { NavLink, Outlet } from 'react-router-dom'
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
  return (
    <div className="site-shell">
      <nav className="site-nav" aria-label="Primary">
        <NavLink to="/" className="site-brand" end>
          {site.name}
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
      <main className="site-main">
        <Outlet />
      </main>
    </div>
  )
}
