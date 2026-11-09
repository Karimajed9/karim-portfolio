import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

export default function AboutPage() {
  return (
    <section>
      <PageHeader title="About" subtitle={site.about.summary} />

      <div className="space-y-10">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Education
          </h2>
          <ul className="space-y-3">
            {site.about.education.map((item) => (
              <li key={item.school} className="border-l-2 border-slate-200 pl-4">
                <p className="font-medium text-slate-900">{item.degree}</p>
                <p className="text-sm text-slate-600">
                  {item.school} · {item.startDate} - {item.endDate}
                </p>
                <p className="text-sm text-slate-600">
                  {item.city}, {item.country}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Goals
          </h2>
          <p className="max-w-2xl leading-relaxed text-slate-700">{site.about.goals}</p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Personal Interests
          </h2>
          <ul className="flex flex-wrap gap-2">
            {site.about.personalInterests.map((interest) => (
              <li
                key={interest}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
              >
                {interest}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Professional Interests
          </h2>
          <ul className="flex flex-wrap gap-2">
            {site.about.professionalInterests.map((interest) => (
              <li
                key={interest}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
              >
                {interest}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}