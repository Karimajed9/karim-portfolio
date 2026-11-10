import { useEffect, useState } from 'react'
import { apiUrl } from '../api'
import PageHeader from '../components/PageHeader'

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

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(apiUrl('/api/skills'))
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load skills')
        return r.json()
      })
      .then(setSkills)
      .catch((e) => setError(e.message))
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
    <section>
      <PageHeader title="Skills" subtitle="Tools and technologies I work with." />
      {error && <p className="mt-4 text-red-600">{error}</p>}

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
