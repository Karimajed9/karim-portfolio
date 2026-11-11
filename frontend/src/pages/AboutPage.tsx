import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadWithStaticFallback, type ApiFallbackReason } from '../api'
import ApiFallbackBanner from '../components/ApiFallbackBanner'
import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

type Education = {
  id: number
  school: string
  city: string
  degree: string
  country: string
  startDate: string
  endDate: string
}

type About = {
  summary: string
  goals: string
  professionalInterests: string
  personalInterests: string
  education: Education[]
}

const staticAbout: About = {
  summary: site.about.summary,
  goals: site.about.goals,
  professionalInterests: site.about.professionalInterests.join(','),
  personalInterests: site.about.personalInterests.join(','),
  education: site.about.education.map((item, index) => ({
    id: index + 1,
    ...item,
  })),
}

function splitCsv(value: string | null | undefined): string[] {
  if (!value) return []
  return value.split(',').map((part) => part.trim()).filter(Boolean)
}

function formatEducationRange(startDate: string, endDate: string): string {
  const start = startDate.includes('/') ? startDate.slice(0, 7).replace('/', ' · ') : startDate
  const end = endDate.includes('/') ? endDate.slice(0, 7).replace('/', ' · ') : endDate
  return `${start} – ${end}`
}

export default function AboutPage() {
  const [about, setAbout] = useState<About | null>(null)
  const [fallbackReason, setFallbackReason] = useState<ApiFallbackReason | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadWithStaticFallback<About>('/api/about', staticAbout, (data, meta) => {
      if (!cancelled) {
        setAbout(data)
        setFallbackReason(meta.usingStatic ? (meta.reason ?? 'offline') : null)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const professionalInterests = splitCsv(about?.professionalInterests)
  const personalInterests = splitCsv(about?.personalInterests)

  return (
    <section className="page-wrap">
      <PageHeader
        index="01"
        title="About"
        subtitle="A concise look at background, education, and what drives the work."
      />
      {fallbackReason ? <ApiFallbackBanner reason={fallbackReason} /> : null}

      {!about ? (
        <p className="prose-quiet">Loading profile…</p>
      ) : (
        <div className="space-y-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div>
              <h2 className="section-label">Introduction</h2>
              <p className="prose-quiet text-[1.05rem]">{about.summary}</p>
            </div>
            <aside className="border border-line bg-surface p-5">
              <p className="section-label">Currently</p>
              <p className="font-display text-xl font-bold tracking-tight text-ink">
                {site.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Deepening Java, Spring Boot, React, TypeScript, and Azure while shipping
                enterprise work.
              </p>
            </aside>
          </div>

          <div>
            <h2 className="section-label">Background & education</h2>
            <ul className="mt-2 space-y-0">
              {about.education.map((item) => (
                <li key={item.id} className="timeline-item">
                  <p className="font-display text-lg font-bold tracking-tight text-ink">
                    {item.degree}
                  </p>
                  <p className="mt-1 text-accent">{item.school}</p>
                  <p className="mt-1 font-mono text-xs tracking-wide text-muted">
                    {item.city}, {item.country} · {formatEducationRange(item.startDate, item.endDate)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="section-label">Goals</h2>
            <p className="prose-quiet">{about.goals}</p>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="section-label">Professional interests</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {professionalInterests.map((interest) => (
                  <li key={interest} className="chip chip--primary">
                    {interest}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="section-label">Personal interests</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {personalInterests.map((interest) => (
                  <li key={interest} className="chip">
                    {interest}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="invite-panel">
            <p className="prose-quiet m-0">
              Prefer a conversation over a résumé parse? Reach out directly.
            </p>
            <Link to="/contact" className="btn btn-primary w-fit">
              Contact
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
