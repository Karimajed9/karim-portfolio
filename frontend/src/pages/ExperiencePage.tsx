import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

export default function ExperiencePage() {
  return (
    <section>
      <PageHeader title="Experience" subtitle="My work experience." />

      <ul className="space-y-0">
        {site.experience.map((item) => (
          <li key={item.company} className="timeline-item">
            <p className="font-display text-xl font-bold tracking-tight text-ink">
              {item.role}
            </p>
            <p className="mt-1 font-medium text-accent">{item.company}</p>
            <p className="mt-1 text-sm text-muted">
              {item.location} · {item.startDate} – {item.endDate}
            </p>
            <ul className="mt-4 space-y-2 text-[0.95rem] leading-relaxed text-ink-soft">
              {item.highlights.map((highlight) => (
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
