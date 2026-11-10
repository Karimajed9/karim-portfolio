import { Link } from 'react-router-dom'
import { site } from '../data/site'

export default function HomePage() {
  return (
    <section className="hero-stage" aria-label="Introduction">
      <div className="hero-media" aria-hidden="true" />
      <div className="hero-content">
        <h1 className="hero-name">{site.name}</h1>
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
        <div className="hero-social">
          <a href={site.githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={site.linkedInUrl} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  )
}
