import { useEffect, useState } from 'react'
import { loadWithStaticFallback } from '../api'
import PageHeader from '../components/PageHeader'
import StatusBanner from '../components/StatusBanner'
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
    let cancelled = false
    void loadWithStaticFallback<Experience[]>(
      '/api/experience',
      staticExperience,
      (data, staticMode) => {
        if (!cancelled) {
          setExperience(data)
          setUsingStatic(staticMode)
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="page-wrap">
      <PageHeader
        index="03"
        title="Experience"
        subtitle="Roles where systems, integrations, and reliability mattered."
      />
      {usingStatic && (
        <StatusBanner>
          Showing static portfolio copy (API offline). Connect a free backend to load live data.
        </StatusBanner>
      )}

      {experience.length === 0 ? (
        <p className="prose-quiet">Loading experience…</p>
      ) : (
        <ol className="space-y-0">
          {experience.map((item, index) => (
            <li key={item.id} className="timeline-item">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                <p className="font-mono text-xs tracking-[0.14em] text-accent uppercase">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="font-mono text-xs tracking-wide text-muted">
                  {item.startDate} – {item.endDate}
                </p>
              </div>
              <p className="mt-3 font-display text-2xl font-bold tracking-tight text-ink">
                {item.role}
              </p>
              <p className="mt-1 text-lg text-accent">{item.company}</p>
              <p className="mt-1 text-sm text-muted">{item.location}</p>
              <ul className="mt-5 space-y-3 text-[0.95rem] leading-relaxed text-ink-soft">
                {splitHighlights(item.highlights).map((highlight) => (
                  <li key={highlight} className="flex gap-3">
                    <span
                      className="mt-[0.55em] h-px w-3 shrink-0 bg-accent"
                      aria-hidden
                    />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
