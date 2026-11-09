import { Link } from 'react-router-dom'
import { site } from '../data/site'

export default function HomePage() {
  return (
    <section className="hero" aria-label="Introduction">
      <p className="hero-role">{site.title}</p>
      <h1 className="hero-name">{site.name}</h1>
      <p className="hero-lede">{site.description}</p>
      <div className="hero-actions">
        <Link to="/projects" className="btn btn-primary">
          View projects
        </Link>
        <Link to="/contact" className="btn btn-secondary">
          Contact me
        </Link>
      </div>
      <div className="hero-social">
        <a href={site.githubUrl} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href={site.linkedInUrl} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
    </section>
  )
}
