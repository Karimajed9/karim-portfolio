import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

export default function SkillsPage() {
  return (
    <section>
      <PageHeader title="Skills" subtitle="Tools and technologies I work with." />

      <div className="space-y-10">
        {site.skills.map((skill) => (
          <div key={skill.category}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
              {skill.category}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {skill.items.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
