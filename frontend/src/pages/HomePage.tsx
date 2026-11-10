import { Link } from 'react-router-dom'
import { site } from '../data/site'

const [firstName, ...restName] = site.name.split(' ')
const lastName = restName.join(' ')

export default function HomePage() {
  return (
    <section className="hero-stage" aria-label="Introduction">
      <div className="hero-media" aria-hidden="true">
        <div className="hero-media-photo" />
        <div className="hero-media-depth" />
        <div className="hero-media-grain" />
      </div>
      <div className="hero-content">
        <p className="hero-mark">Portfolio · Montreal</p>
        <h1 className="hero-name">
          <span className="hero-name-line">{firstName}</span>{' '}
          <span className="hero-name-line hero-name-line--last">{lastName}</span>
        </h1>
        <p className="hero-headline">{site.title}</p>
        <p className="hero-lede">{site.description}</p>
        <div className="hero-actions">
          <Link to="/projects" className="btn btn-primary">
            View projects
          </Link>
          <Link to="/contact" className="btn btn-secondary">
            Contact me
          </Link>
        </div>
        <div className="hero-meta">
          <a href={site.githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <span className="hero-meta-sep" aria-hidden="true" />
          <a href={site.linkedInUrl} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  )
}
