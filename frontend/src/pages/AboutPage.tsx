import { useEffect, useState } from 'react'
import { fetchJsonCached } from '../api'
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

export default function AboutPage() {
  const [about, setAbout] = useState<About | null>(null)
  const [usingStatic, setUsingStatic] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchJsonCached<About>('/api/about', (data) => {
      if (!cancelled) {
        setAbout(data)
        setUsingStatic(false)
      }
    }).catch(() => {
      if (!cancelled) {
        setAbout(staticAbout)
        setUsingStatic(true)
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
      <PageHeader index="01" title="About" subtitle={about?.summary ?? 'Loading…'} />
      {usingStatic && (
        <p className="mt-4 text-sm text-muted">
          Showing static portfolio copy (API offline). Connect a free backend to load live data.
        </p>
      )}

      {about && (
        <div className="space-y-12">
          <div>
            <h2 className="section-label">Education</h2>
            <ul className="space-y-0">
              {about.education.map((item) => (
                <li key={item.id} className="timeline-item">
                  <p className="font-semibold text-ink">{item.degree}</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {item.school} · {item.startDate} – {item.endDate}
                  </p>
                  <p className="text-sm text-muted">
                    {item.city}, {item.country}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="section-label">Goals</h2>
            <p className="prose-quiet">{about.goals}</p>
          </div>

          <div>
            <h2 className="section-label">Professional Interests</h2>
            <ul className="flex flex-wrap gap-2">
              {professionalInterests.map((interest) => (
                <li key={interest} className="chip">
                  {interest}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="section-label">Personal Interests</h2>
            <ul className="flex flex-wrap gap-2">
              {personalInterests.map((interest) => (
                <li key={interest} className="chip">
                  {interest}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
