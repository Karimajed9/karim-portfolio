import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

export default function SkillsPage() {
  return (
    <section>
      <PageHeader title="Skills" subtitle="Tools and technologies I work with." />

      <div className="space-y-10">
        {site.skills.map((skill) => (
          <div key={skill.category}>
            <h2 className="section-label">{skill.category}</h2>
            <ul className="flex flex-wrap gap-2">
              {skill.items.map((item) => (
                <li key={item} className="chip">
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
