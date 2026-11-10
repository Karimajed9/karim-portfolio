import { useEffect, useState } from 'react'
import { apiUrl } from '../api'
import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

type Experience = {
  id: number
  company: string
  role: string
  startDate: string
  endDate: string
  location: string
  highlights: string
}

const staticExperience: Experience[] = site.experience.map((item, index) => ({
  id: index + 1,
  company: item.company,
  role: item.role,
  startDate: item.startDate,
  endDate: item.endDate,
  location: item.location,
  highlights: item.highlights.join('|||'),
}))

function splitHighlights(value: string | null | undefined): string[] {
  if (!value) return []
  return value.split('|||').map((part) => part.trim()).filter(Boolean)
}

export default function ExperiencePage() {
  const [experience, setExperience] = useState<Experience[]>([])
  const [usingStatic, setUsingStatic] = useState(false)

  useEffect(() => {
    fetch(apiUrl('/api/experience'))
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load experience')
        return r.json()
      })
      .then((data: Experience[]) => {
        setExperience(data)
        setUsingStatic(false)
      })
      .catch(() => {
        setExperience(staticExperience)
        setUsingStatic(true)
      })
  }, [])

  return (
    <section className="page-wrap">
      <PageHeader index="03" title="Experience" subtitle="Roles where I build and ship software." />
      {usingStatic && (
        <p className="mt-4 text-sm text-muted">
          Showing static portfolio copy (API offline). Connect a free backend to load live data.
        </p>
      )}

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
