import { useEffect, useState } from 'react'
import { loadWithStaticFallback } from '../api'
import PageHeader from '../components/PageHeader'
import StatusBanner from '../components/StatusBanner'
import { site } from '../data/site'
import { groupSkillsByDomain } from '../lib/skills'

type Skill = {
  id: number
  category: string
  name: string
  sortOrder: number
}

const staticSkills: Skill[] = site.skills.flatMap((group, groupIndex) =>
  group.items.map((name, itemIndex) => ({
    id: groupIndex * 100 + itemIndex + 1,
    category: group.category,
    name,
    sortOrder: itemIndex + 1,
  })),
)

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [usingStatic, setUsingStatic] = useState(false)

  useEffect(() => {
    let cancelled = false
    void loadWithStaticFallback<Skill[]>('/api/skills', staticSkills, (data, staticMode) => {
      if (!cancelled) {
        setSkills(data)
        setUsingStatic(staticMode)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const groups = groupSkillsByDomain(skills)

  return (
    <section className="page-wrap">
      <PageHeader
        index="02"
        title="Skills"
        subtitle="Organized by domain — primary tools first, supporting craft second."
      />
      {usingStatic && (
        <StatusBanner>
          Showing static portfolio copy (API offline). Connect a free backend to load live data.
        </StatusBanner>
      )}

      {skills.length === 0 ? (
        <p className="prose-quiet">Loading skills…</p>
      ) : (
        <div className="domain-grid">
          {groups.map((group) => (
            <article key={group.domain} className="domain-card">
              <h2 className="domain-title">{group.domain}</h2>
              {group.primary.length > 0 ? (
                <div className="mb-4">
                  <p className="section-label !mb-2">Primary</p>
                  <ul className="domain-list">
                    {group.primary.map((item) => (
                      <li key={item.id} className="chip chip--primary">
                        {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {group.supporting.length > 0 ? (
                <div>
                  <p className="section-label !mb-2">Supporting</p>
                  <ul className="domain-list">
                    {group.supporting.map((item) => (
                      <li key={item.id} className="chip">
                        {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
