import { useEffect, useMemo, useState } from 'react'
import ContactForm from '../components/ContactForm'
import DeparturesBoard from '../components/DeparturesBoard'
import FlipDigits from '../components/FlipDigits'
import SectionHeading from '../components/SectionHeading'
import { useLocale } from '../i18n/LocaleContext'
import {
  buildStaticAbout,
  buildStaticExperience,
  buildStaticProjects,
  buildStaticSkills,
  toEducationViews,
  toExperienceViews,
  toProjectViews,
  toSkillGroups,
} from '../lib/contentApi'
import { cvEnPath, cvFrPath } from '../lib/cv'
import { useStaticApiResource } from '../lib/useStaticApiResource'

const SECTION_IDS = [
  'profile',
  'experience',
  'projects',
  'skills',
  'education',
  'mobility',
  'contact',
] as const

type SectionId = (typeof SECTION_IDS)[number]

export default function HomePage() {
  const { locale, site, ui } = useLocale()
  const [active, setActive] = useState<SectionId>('profile')
  const [copied, setCopied] = useState(false)

  const sections = useMemo(
    () =>
      [
        { id: 'profile' as const, num: '01', label: ui.sections.profile },
        { id: 'experience' as const, num: '02', label: ui.sections.experience },
        { id: 'projects' as const, num: '03', label: ui.sections.projects },
        { id: 'skills' as const, num: '04', label: ui.sections.skills },
        { id: 'education' as const, num: '05', label: ui.sections.education },
        { id: 'mobility' as const, num: '06', label: ui.sections.mobility },
        { id: 'contact' as const, num: '07', label: ui.sections.contact },
      ],
    [ui],
  )

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const nodes = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (node): node is HTMLElement => Boolean(node),
    )
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) {
          setActive(visible.target.id as SectionId)
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0.1, 0.25, 0.5] },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(site.contact.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const staticExperience = useMemo(() => buildStaticExperience(site), [site])
  const staticProjects = useMemo(() => buildStaticProjects(site), [site])
  const staticSkills = useMemo(() => buildStaticSkills(site), [site])
  const staticAbout = useMemo(() => buildStaticAbout(site), [site])
  const { data: experienceData } = useStaticApiResource(
    '/api/experience',
    staticExperience,
    locale,
  )
  const { data: projectsData } = useStaticApiResource(
    '/api/projects',
    staticProjects,
    locale,
  )
  const { data: skillsData } = useStaticApiResource(
    '/api/skills',
    staticSkills,
    locale,
  )
  const { data: aboutData } = useStaticApiResource(
    '/api/about',
    staticAbout,
    locale,
  )
  const experience = useMemo(() => toExperienceViews(experienceData), [experienceData])
  const projects = useMemo(
    () => toProjectViews(projectsData, site.projects.items),
    [projectsData, site.projects.items],
  )
  const skills = useMemo(() => toSkillGroups(skillsData), [skillsData])
  const education = useMemo(() => toEducationViews(aboutData), [aboutData])

  const [firstName, ...rest] = site.name.split(' ')
  const lastName = rest.join(' ')
  const preferredCv = locale === 'fr' ? cvFrPath : cvEnPath
  const preferredCvLabel = locale === 'fr' ? ui.cv.downloadFr : ui.cv.downloadEn

  return (
    <>
      <section id="top" className="page-frame arch-section--hero" aria-label={ui.home.introAria}>
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 className="hero-name">
              <span>{firstName}</span>
              <span>{lastName}</span>
            </h1>
            <p className="hero-role">{site.shortTitle}</p>
            <p className="hero-meta">{site.metaLine}</p>
            <div className="hero-actions">
              <a href="#contact" className="btn btn-primary">
                {ui.home.getInTouch} <span aria-hidden="true">→</span>
              </a>
              <a href={preferredCv} className="btn btn-secondary" download>
                {preferredCvLabel} <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <DeparturesBoard />
        </div>
      </section>

      <div className="page-frame page-columns">
        <aside className="section-rail">
          <nav className="section-rail-nav" aria-label={ui.nav.sections}>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`section-rail-link${active === section.id ? ' is-active' : ''}`}
              >
                <span className="section-rail-num">{section.num}</span>
                <span>{section.label}</span>
                <span className="section-rail-dot" aria-hidden="true" />
              </a>
            ))}
          </nav>
        </aside>

        <div className="content-column">
          <nav className="mobile-sections" aria-label={ui.nav.sections}>
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.num} {section.label}
              </a>
            ))}
          </nav>

          <section id="profile" className="arch-section">
            <SectionHeading title={ui.sections.profile} index="01" />
            <p className="profile-lede">{site.about.summary}</p>
            <div className="lang-row">
              <span>{ui.home.languages}</span>
              {site.languages.map((language) => (
                <span key={language}>{language}</span>
              ))}
            </div>
          </section>

          <section id="experience" className="arch-section">
            <SectionHeading title={ui.experience.title} index="02" />
            {experience.map((job) => (
              <article key={job.id} className="job">
                <div className="job-meta">
                  <div>
                    {job.startDate} –{' '}
                    {job.endDate.toLowerCase().includes('present') ||
                    job.endDate.toLowerCase().includes('aujourd') ? (
                      <span className="job-present">{ui.experience.present}</span>
                    ) : (
                      job.endDate
                    )}
                  </div>
                  <div className="job-location">{job.location}</div>
                  <p className="job-company">{job.company}</p>
                </div>
                <div className="job-body">
                  <h3 className="job-role">{job.role}</h3>
                  <ul className="job-list">
                    {job.highlights.map((item) => (
                      <li key={item}>
                        <span aria-hidden="true">–</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </section>

          <section id="projects" className="arch-section">
            <SectionHeading title={ui.projects.title} index="03" />
            <div className="project-grid">
              {projects.map((project) => (
                <article key={project.id}>
                  <div className="project-card-visual">
                    <div className="project-card-mark">
                      {project.mark}
                      <span>.</span>
                    </div>
                  </div>
                  <div className="project-card-tags">{project.tags.join(' · ')}</div>
                  <h3 className="project-card-title">{project.name}</h3>
                  <p className="project-card-summary">{project.summary}</p>
                  <a
                    href={project.href}
                    className="project-card-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {ui.projects.viewRepo} ↗
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section id="skills" className="arch-section">
            <SectionHeading title={ui.skills.title} index="04" />
            {skills.map((group) => (
              <div key={group.category} className="skill-row">
                <div className="skill-label">{group.category}</div>
                <ul className="skill-items">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section id="education" className="arch-section">
            <SectionHeading title={ui.education.title} index="05" />
            {education.map((item) => (
              <article key={item.id} className="edu-row">
                <div className="edu-year">{item.yearLabel}</div>
                <div>
                  <h3 className="edu-degree">{item.degree}</h3>
                  <p className="edu-school">
                    {item.school}, {item.city}, {item.country}
                  </p>
                  <p className="edu-school">
                    {item.startDate} – {item.endDate}
                  </p>
                </div>
              </article>
            ))}
          </section>

          <section id="mobility" className="arch-section">
            <SectionHeading title={ui.mobility.title} index="06" />
            <p className="mobility-lede">{site.mobility.basedIn}</p>
            <p className="mobility-headline">{site.mobility.headline}</p>
            <div className="mobility-grid">
              {site.mobility.destinations.map((destination) => (
                <article key={destination.code} className="mobility-card">
                  <div className="mobility-card-head">
                    <FlipDigits value={destination.code} />
                    <h3 className="mobility-card-title">{destination.name}</h3>
                  </div>
                  <p className="mobility-card-body">{destination.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="contact" className="arch-section">
            <SectionHeading title={ui.contact.title} index="07" />
            <div className="contact-email-row">
              <a href={`mailto:${site.contact.email}`} className="contact-email">
                {site.contact.email}
              </a>
              <button type="button" className="btn btn-ghost" onClick={() => void copyEmail()}>
                {copied ? ui.home.copied : ui.home.copyEmail}
              </button>
            </div>
            <p className="contact-blurb">{site.contact.blurb}</p>
            <div className="hero-actions hero-actions--compact">
              <a href={cvEnPath} className="btn btn-secondary" download>
                {ui.cv.downloadEn}
              </a>
              <a href={cvFrPath} className="btn btn-secondary" download>
                {ui.cv.downloadFr}
              </a>
            </div>
            <ContactForm />
          </section>
        </div>
      </div>
    </>
  )
}
