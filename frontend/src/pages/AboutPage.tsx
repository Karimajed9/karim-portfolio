import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

export default function AboutPage() {
  return (
    <section>
      <PageHeader title="About" subtitle={site.about.summary} />

      <div className="space-y-12">
        <div>
          <h2 className="section-label">Education</h2>
          <ul className="space-y-0">
            {site.about.education.map((item) => (
              <li key={item.school} className="timeline-item">
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
          <p className="prose-quiet">{site.about.goals}</p>
        </div>

        <div>
          <h2 className="section-label">Personal Interests</h2>
          <ul className="flex flex-wrap gap-2">
            {site.about.personalInterests.map((interest) => (
              <li key={interest} className="chip">
                {interest}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="section-label">Professional Interests</h2>
          <ul className="flex flex-wrap gap-2">
            {site.about.professionalInterests.map((interest) => (
              <li key={interest} className="chip">
                {interest}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
