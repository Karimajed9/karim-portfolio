import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

export default function ExperiencePage() {
  return (
    <section>
      <PageHeader title="Experience" subtitle="My work experience." />

      <div className="space-y-10">
        <div>
          <ul className="space-y-3">
            {site.experience.map((item) => (
              <li key={item.company} className="border-l-2 border-slate-200 pl-4">
                <p className="font-medium text-slate-900">
                  {item.role} at {item.company}
                </p>
                <p className="text-sm text-slate-600">
                  {item.location} · {item.startDate} - {item.endDate}
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
                  {item.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}