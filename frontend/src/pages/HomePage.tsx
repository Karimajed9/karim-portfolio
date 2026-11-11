import { Link } from 'react-router-dom'
import ArchitecturalVisual from '../components/ArchitecturalVisual'
import ProjectList from '../components/ProjectList'
import { site } from '../data/site'

const [firstName, ...restName] = site.name.split(' ')
const lastName = restName.join(' ')

const highlights = [
  {
    value: '5+ years',
    label: 'Building and maintaining enterprise applications',
  },
  {
    value: '10+ environments',
    label: 'Production deployments managed at Redmane Technology',
  },
  {
    value: '.NET · Java · SQL',
    label: 'Enterprise stacks with REST API integrations',
  },
  {
    value: 'Azure',
    label: 'Logic Apps, Functions, and cloud-minded delivery',
  },
] as const

const featuredPeek = site.projects.items.slice(0, 1).map((item, index) => ({
  id: index + 1,
  name: item.name,
  summary: item.summary,
  tags: item.tags,
  href: item.href,
}))

export default function HomePage() {
  return (
    <>
      <section className="hero-stage" aria-label="Introduction">
        <div className="hero-media" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-copy">
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
          <div className="hero-visual">
            <ArchitecturalVisual />
          </div>
        </div>
      </section>

      <div className="page-wrap !pt-0">
        <section className="section-block" aria-labelledby="highlights-heading">
          <p className="section-label">At a glance</p>
          <h2 id="highlights-heading" className="section-heading">
            Built for production systems
          </h2>
          <div className="highlight-grid mt-8">
            {highlights.map((item) => (
              <article key={item.value} className="highlight-item">
                <p className="highlight-value">{item.value}</p>
                <p className="highlight-label">{item.label}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/experience" className="text-link">
              Experience
            </Link>
            <Link to="/skills" className="text-link">
              Skills
            </Link>
          </div>
        </section>

        {featuredPeek.length > 0 ? (
          <section className="section-block" aria-labelledby="work-heading">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-label">Featured</p>
                <h2 id="work-heading" className="section-heading">
                  One project peek
                </h2>
              </div>
              <Link to="/projects" className="text-link">
                All projects
              </Link>
            </div>
            <div className="mt-8">
              <ProjectList projects={featuredPeek} />
            </div>
          </section>
        ) : null}

        <section className="section-block" aria-labelledby="invite-heading">
          <div className="invite-panel">
            <div>
              <p className="section-label">Next</p>
              <h2 id="invite-heading" className="section-heading">
                Want the fuller picture?
              </h2>
              <p className="prose-quiet mt-4">
                Background, education, and interests live on About. Open to roles and
                collaborations — say hello anytime.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/about" className="btn btn-secondary">
                About
              </Link>
              <Link to="/contact" className="btn btn-primary">
                Contact
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
