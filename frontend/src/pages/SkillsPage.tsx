import { useEffect, useState } from 'react'
import { apiUrl } from '../api'
import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

type Skill = {
  id: number
  category: string
  name: string
  sortOrder: number
}

type SkillGroup = {
  category: string
  items: Skill[]
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
    fetch(apiUrl('/api/skills'))
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load skills')
        return r.json()
      })
      .then((data: Skill[]) => {
        setSkills(data)
        setUsingStatic(false)
      })
      .catch(() => {
        setSkills(staticSkills)
        setUsingStatic(true)
      })
  }, [])

  const byCategory = new Map<string, Skill[]>()
  for (const skill of skills) {
    const existing = byCategory.get(skill.category) ?? []
    existing.push(skill)
    byCategory.set(skill.category, existing)
  }
  const groups: SkillGroup[] = []
  for (const [category, items] of byCategory) {
    groups.push({ category, items })
  }

  return (
    <section className="page-wrap">
      <PageHeader index="02" title="Skills" subtitle="Tools and technologies I work with." />
      {usingStatic && (
        <p className="mt-4 text-sm text-muted">
          Showing static portfolio copy (API offline). Connect a free backend to load live data.
        </p>
      )}

      <div className="space-y-10">
        {groups.map((group) => (
          <div key={group.category}>
            <h2 className="section-label">{group.category}</h2>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item.id} className="chip">
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
