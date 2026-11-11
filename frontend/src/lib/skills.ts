/** Display domains for the Skills page / home preview. Mapped by skill name. */
export const DOMAIN_ORDER = [
  'Backend',
  'Frontend',
  'Cloud & integrations',
  'Databases',
  'Tools & practices',
] as const

export type SkillDomain = (typeof DOMAIN_ORDER)[number]

type SkillMeta = {
  domain: SkillDomain
  primary?: boolean
}

const SKILL_META: Record<string, SkillMeta> = {
  'C#': { domain: 'Backend', primary: true },
  Java: { domain: 'Backend', primary: true },
  SQL: { domain: 'Backend', primary: true },
  'ASP.NET': { domain: 'Backend', primary: true },
  'Spring Boot': { domain: 'Backend', primary: true },
  'REST APIs': { domain: 'Backend', primary: true },
  TypeScript: { domain: 'Frontend', primary: true },
  JavaScript: { domain: 'Frontend', primary: true },
  React: { domain: 'Frontend', primary: true },
  HTML: { domain: 'Frontend' },
  CSS: { domain: 'Frontend' },
  Tailwind: { domain: 'Frontend', primary: true },
  Azure: { domain: 'Cloud & integrations', primary: true },
  Docker: { domain: 'Cloud & integrations' },
  'GitHub Actions': { domain: 'Cloud & integrations' },
  PostgreSQL: { domain: 'Databases', primary: true },
  'SQL Server': { domain: 'Databases', primary: true },
  Git: { domain: 'Tools & practices', primary: true },
  Maven: { domain: 'Tools & practices' },
  Vite: { domain: 'Tools & practices' },
}

const CATEGORY_FALLBACK: Record<string, SkillDomain> = {
  'Programming Languages': 'Backend',
  Frontend: 'Frontend',
  Backend: 'Backend',
  Databases: 'Databases',
  'Cloud & DevOps': 'Cloud & integrations',
  Tools: 'Tools & practices',
}

export type NamedSkill = {
  id: number | string
  name: string
  category?: string
}

export type DomainGroup = {
  domain: SkillDomain
  primary: NamedSkill[]
  supporting: NamedSkill[]
}

export function groupSkillsByDomain(skills: NamedSkill[]): DomainGroup[] {
  const buckets = new Map<SkillDomain, DomainGroup>()
  for (const domain of DOMAIN_ORDER) {
    buckets.set(domain, { domain, primary: [], supporting: [] })
  }

  for (const skill of skills) {
    const meta = SKILL_META[skill.name]
    const domain =
      meta?.domain ??
      (skill.category ? CATEGORY_FALLBACK[skill.category] : undefined) ??
      'Tools & practices'
    const group = buckets.get(domain)!
    if (meta?.primary) group.primary.push(skill)
    else group.supporting.push(skill)
  }

  return DOMAIN_ORDER.map((domain) => buckets.get(domain)!).filter(
    (g) => g.primary.length + g.supporting.length > 0,
  )
}
