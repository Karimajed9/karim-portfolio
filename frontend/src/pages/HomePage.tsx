import { Link } from 'react-router-dom'
import ArchitecturalVisual from '../components/ArchitecturalVisual'
import ProjectList from '../components/ProjectList'
import { useLocale } from '../i18n/LocaleContext'

export default function HomePage() {
  const { site, ui } = useLocale()
  const [firstName, ...restName] = site.name.split(' ')
  const lastName = restName.join(' ')

  const featuredPeek = site.projects.items.slice(0, 1).map((item, index) => ({
    id: index + 1,
    name: item.name,
    summary: item.summary,
    tags: item.tags,
    href: item.href,
  }))

  return (
    <>
      <section className="hero-stage" aria-label={ui.home.introAria}>
        <div className="hero-media" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-copy">
            <p className="hero-mark">{ui.home.mark}</p>
            <h1 className="hero-name">
              <span className="hero-name-line">{firstName}</span>{' '}
              <span className="hero-name-line hero-name-line--last">{lastName}</span>
            </h1>
            <p className="hero-headline">{site.title}</p>
            <p className="hero-lede">{site.description}</p>
            <div className="hero-actions">
              <Link to="/projects" className="btn btn-primary">
                {ui.home.seeProjects}
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                {ui.home.contact}
              </Link>
            </div>
            <div className="hero-meta">
              <a href={site.githubUrl} target="_blank" rel="noreferrer">
                {ui.social.github}
              </a>
              <span className="hero-meta-sep" aria-hidden="true" />
              <a href={site.linkedInUrl} target="_blank" rel="noreferrer">
                {ui.social.linkedIn}
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <ArchitecturalVisual label={ui.home.blueprintLabel} />
          </div>
        </div>
      </section>

      <div className="page-wrap !pt-0">
        <section className="section-block" aria-labelledby="highlights-heading">
          <p className="section-label">{ui.home.highlightsLabel}</p>
          <h2 id="highlights-heading" className="section-heading">
            {ui.home.highlightsHeading}
          </h2>
          <div className="highlight-grid mt-8">
            {ui.home.highlightItems.map((item) => (
              <article key={item.value} className="highlight-item">
                <p className="highlight-value">{item.value}</p>
                <p className="highlight-label">{item.label}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/experience" className="text-link">
              {ui.nav.experience}
            </Link>
            <Link to="/skills" className="text-link">
              {ui.nav.skills}
            </Link>
          </div>
        </section>

        {featuredPeek.length > 0 ? (
          <section className="section-block" aria-labelledby="work-heading">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-label">{ui.home.projectsLabel}</p>
                <h2 id="work-heading" className="section-heading">
                  {ui.home.featuredHeading}
                </h2>
              </div>
              <Link to="/projects" className="text-link">
                {ui.home.allProjects}
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
              <p className="section-label">{ui.home.moreLabel}</p>
              <h2 id="invite-heading" className="section-heading">
                {ui.home.moreHeading}
              </h2>
              <p className="prose-quiet mt-4">{ui.home.moreBody}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/about" className="btn btn-secondary">
                {ui.home.about}
              </Link>
              <Link to="/contact" className="btn btn-primary">
                {ui.home.contact}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
