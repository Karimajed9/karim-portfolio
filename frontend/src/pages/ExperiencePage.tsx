import { useEffect, useState } from 'react'
import { apiUrl } from '../api'
import PageHeader from '../components/PageHeader'

type Experience = {
  id: number
  company: string
  role: string
  startDate: string
  endDate: string
  location: string
  highlights: string
}

function splitHighlights(value: string | null | undefined): string[] {
  if (!value) return []
  return value.split('|||').map((part) => part.trim()).filter(Boolean)
}

export default function ExperiencePage() {
  const [experience, setExperience] = useState<Experience[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(apiUrl('/api/experience'))
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load experience')
        return r.json()
      })
      .then(setExperience)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <section className="page-wrap">
      <PageHeader index="03" title="Experience" subtitle="Roles where I build and ship software." />
      {error && <p className="mt-4 text-red-600">{error}</p>}

      <ul className="space-y-0">
        {experience.map((item) => (
          <li key={item.id} className="timeline-item">
            <p className="font-display text-xl font-bold tracking-tight text-ink">
              {item.role}
            </p>
            <p className="mt-1 font-medium text-accent">{item.company}</p>
            <p className="mt-1 text-sm text-muted">
              {item.location} · {item.startDate} – {item.endDate}
            </p>
            <ul className="mt-4 space-y-2 text-[0.95rem] leading-relaxed text-ink-soft">
              {splitHighlights(item.highlights).map((highlight) => (
                <li key={highlight} className="flex gap-2">
                  <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-sm bg-accent" aria-hidden />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}
