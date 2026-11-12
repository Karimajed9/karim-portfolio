import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ArchitectureDiagram from '../components/ArchitectureDiagram'
import SectionHeading from '../components/SectionHeading'
import { useLocale } from '../i18n/LocaleContext'
import {
  buildStaticProjects,
  findProjectBySlug,
  nextProject,
  toProjectViews,
} from '../lib/contentApi'
import { useStaticApiResource } from '../lib/useStaticApiResource'

const SECTIONS = [
  'overview',
  'metadata',
  'problem',
  'architecture',
  'features',
  'tradeoffs',
  'challenges',
  'testing',
  'gallery',
  'lessons',
  'links',
] as const

type SectionId = (typeof SECTIONS)[number]

function Cover({
  src,
  mark,
  missingLabel,
}: {
  src: string
  mark: string
  missingLabel: string
}) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className="case-hero-visual case-hero-visual--fallback" role="img" aria-label={missingLabel}>
        <div className="project-card-mark">
          {mark || '?'}
          <span>.</span>
        </div>
      </div>
    )
  }
  return (
    <div className="case-hero-visual">
      <img
        src={src}
        alt=""
        className="case-hero-image"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

function GalleryImage({ src, missingLabel }: { src: string; missingLabel: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="case-gallery-item case-gallery-item--fallback" role="img" aria-label={missingLabel}>
        <span>{missingLabel}</span>
      </div>
    )
  }
  return (
    <div className="case-gallery-item">
      <img src={src} alt="" onError={() => setFailed(true)} />
    </div>
  )
}

export default function ProjectCaseStudyPage() {
  const { slug = '' } = useParams()
  const { locale, site, ui } = useLocale()
  const staticProjects = useMemo(
    () => buildStaticProjects(site, locale),
    [site, locale],
  )
  const { data: projectsData } = useStaticApiResource(
    '/api/projects',
    staticProjects,
    locale,
  )
  const projects = useMemo(
    () => toProjectViews(projectsData, site.projects.items, locale),
    [projectsData, site.projects.items, locale],
  )
  const project = findProjectBySlug(projects, slug)
  const following = project ? nextProject(projects, project.slug) : undefined

  const sectionLabels: Record<SectionId, string> = {
    overview: ui.caseStudy.overview,
    metadata: ui.caseStudy.metadata,
    problem: ui.caseStudy.problem,
    architecture: ui.caseStudy.architecture,
    features: ui.caseStudy.features,
    tradeoffs: ui.caseStudy.tradeoffs,
    challenges: ui.caseStudy.challenges,
    testing: ui.caseStudy.testing,
    gallery: ui.caseStudy.gallery,
    lessons: ui.caseStudy.lessons,
    links: ui.caseStudy.links,
  }

  const visibleSections = SECTIONS.filter((id) => {
    if (!project) return false
    if (id === 'gallery') return project.galleryUrls.length > 0
    if (id === 'features') return project.features.length > 0
    if (id === 'tradeoffs') return project.tradeoffs.length > 0
    if (id === 'challenges') return project.challenges.length > 0
    if (id === 'lessons') return project.lessons.length > 0
    if (id === 'testing') return Boolean(project.testing)
    if (id === 'problem') return Boolean(project.problem)
    if (id === 'overview') return Boolean(project.overview)
    return true
  })

  if (!project) {
    return (
      <section className="page-wrap case-page">
        <p className="prose-quiet">{ui.caseStudy.notFound}</p>
        <Link to="/#projects" className="project-card-link">
          {ui.caseStudy.backToProjects}
        </Link>
      </section>
    )
  }

  return (
    <section className="page-wrap case-page">
      <nav className="case-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">{ui.caseStudy.breadcrumbHome}</Link>
        <span aria-hidden="true">/</span>
        <Link to="/#projects">{ui.caseStudy.breadcrumbProjects}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{project.name}</span>
      </nav>

      <div className="case-layout">
        <aside className="case-nav" aria-label={ui.caseStudy.sectionNav}>
          <ul>
            {visibleSections.map((id) => (
              <li key={id}>
                <a href={`#${id}`}>{sectionLabels[id]}</a>
              </li>
            ))}
          </ul>
        </aside>

        <div className="case-main">
          <header className="case-hero">
            <p className="case-kicker">
              {[project.category, project.status].filter(Boolean).join(' · ')}
            </p>
            <h1 className="case-title">{project.name}</h1>
            {project.summary ? <p className="case-lede">{project.summary}</p> : null}
            <Cover
              src={project.coverImageUrl}
              mark={project.mark}
              missingLabel={ui.caseStudy.missingCover}
            />
          </header>

          {project.overview ? (
            <section id="overview" className="case-section">
              <SectionHeading title={ui.caseStudy.overview} index="01" />
              <p className="prose-quiet">{project.overview}</p>
            </section>
          ) : null}

          <section id="metadata" className="case-section">
            <SectionHeading title={ui.caseStudy.metadata} index="02" />
            <dl className="case-meta">
              {project.role ? (
                <>
                  <dt>{ui.caseStudy.role}</dt>
                  <dd>{project.role}</dd>
                </>
              ) : null}
              {project.tags.length > 0 ? (
                <>
                  <dt>{ui.caseStudy.tech}</dt>
                  <dd>{project.tags.join(' · ')}</dd>
                </>
              ) : null}
              {project.status ? (
                <>
                  <dt>{ui.caseStudy.status}</dt>
                  <dd>{project.status}</dd>
                </>
              ) : null}
              {project.href ? (
                <>
                  <dt>{ui.caseStudy.source}</dt>
                  <dd>
                    <a href={project.href} target="_blank" rel="noreferrer">
                      {ui.projects.github} ↗
                    </a>
                  </dd>
                </>
              ) : null}
              {project.liveDemoUrl ? (
                <>
                  <dt>{ui.caseStudy.demo}</dt>
                  <dd>
                    <a href={project.liveDemoUrl} target="_blank" rel="noreferrer">
                      {ui.projects.liveDemo} ↗
                    </a>
                  </dd>
                </>
              ) : null}
            </dl>
          </section>

          {project.problem ? (
            <section id="problem" className="case-section">
              <SectionHeading title={ui.caseStudy.problem} index="03" />
              <p className="prose-quiet">{project.problem}</p>
            </section>
          ) : null}

          <section id="architecture" className="case-section">
            <SectionHeading title={ui.caseStudy.architecture} index="04" />
            {project.architectureImageUrl ? (
              <GalleryImage
                src={project.architectureImageUrl}
                missingLabel={ui.caseStudy.missingImage}
              />
            ) : (
              <ArchitectureDiagram caption={project.architectureCaption} />
            )}
            {project.architectureImageUrl && project.architectureCaption ? (
              <p className="case-arch-caption">{project.architectureCaption}</p>
            ) : null}
          </section>

          {project.features.length > 0 ? (
            <section id="features" className="case-section">
              <SectionHeading title={ui.caseStudy.features} index="05" />
              <ul className="case-list">
                {project.features.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {project.tradeoffs.length > 0 ? (
            <section id="tradeoffs" className="case-section">
              <SectionHeading title={ui.caseStudy.tradeoffs} index="06" />
              <ul className="case-list">
                {project.tradeoffs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {project.challenges.length > 0 ? (
            <section id="challenges" className="case-section">
              <SectionHeading title={ui.caseStudy.challenges} index="07" />
              <ul className="case-list">
                {project.challenges.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {project.testing ? (
            <section id="testing" className="case-section">
              <SectionHeading title={ui.caseStudy.testing} index="08" />
              <p className="prose-quiet">{project.testing}</p>
            </section>
          ) : null}

          {project.galleryUrls.length > 0 ? (
            <section id="gallery" className="case-section">
              <SectionHeading title={ui.caseStudy.gallery} index="09" />
              <div className="case-gallery">
                {project.galleryUrls.map((src) => (
                  <GalleryImage
                    key={src}
                    src={src}
                    missingLabel={ui.caseStudy.missingImage}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {project.lessons.length > 0 ? (
            <section id="lessons" className="case-section">
              <SectionHeading title={ui.caseStudy.lessons} index="10" />
              <ul className="case-list">
                {project.lessons.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section id="links" className="case-section">
            <SectionHeading title={ui.caseStudy.links} index="11" />
            <div className="case-links">
              {project.href ? (
                <a href={project.href} className="btn btn-secondary" target="_blank" rel="noreferrer">
                  {ui.projects.github} ↗
                </a>
              ) : null}
              {project.liveDemoUrl ? (
                <a
                  href={project.liveDemoUrl}
                  className="btn btn-secondary"
                  target="_blank"
                  rel="noreferrer"
                >
                  {ui.projects.liveDemo} ↗
                </a>
              ) : null}
              {following ? (
                <Link to={`/projects/${following.slug}`} className="btn btn-primary">
                  {ui.caseStudy.nextProject}: {following.name}
                </Link>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
