import { useEffect, useState } from 'react'
import { apiUrl } from '../api'
import PageHeader from '../components/PageHeader'

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

function splitCsv(value: string | null | undefined): string[] {
  if (!value) return []
  return value.split(',').map((part) => part.trim()).filter(Boolean)
}

export default function AboutPage() {
  const [about, setAbout] = useState<About | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(apiUrl('/api/about'))
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load about')
        return r.json()
      })
      .then(setAbout)
      .catch((e) => setError(e.message))
  }, [])

  const professionalInterests = splitCsv(about?.professionalInterests)
  const personalInterests = splitCsv(about?.personalInterests)

  return (
    <section className="page-wrap">
      <PageHeader index="01" title="About" subtitle={about?.summary ?? 'Loading…'} />
      {error && <p className="mt-4 text-red-600">{error}</p>}

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
            <h2 className="section-label">Personal Interests</h2>
            <ul className="flex flex-wrap gap-2">
              {personalInterests.map((interest) => (
                <li key={interest} className="chip">
                  {interest}
                </li>
              ))}
            </ul>
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
        </div>
      )}
    </section>
  )
}
