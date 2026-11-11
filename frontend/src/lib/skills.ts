/** Display domains for the Skills page / home preview. Mapped by skill name. */
export const DOMAIN_ORDER = [
  'Backend',
  'Frontend',
  'Cloud',
  'Databases',
  'Tools',
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
  '.NET Framework': { domain: 'Backend', primary: true },
  'Spring Boot': { domain: 'Backend', primary: true },
  'REST APIs': { domain: 'Backend', primary: true },
  Idempotency: { domain: 'Backend', primary: true },
  TypeScript: { domain: 'Frontend', primary: true },
  JavaScript: { domain: 'Frontend', primary: true },
  React: { domain: 'Frontend', primary: true },
  Azure: { domain: 'Cloud', primary: true },
  'Azure Functions': { domain: 'Cloud', primary: true },
  'Logic Apps': { domain: 'Cloud', primary: true },
  'Azure Web Apps': { domain: 'Cloud' },
  'Blob Storage': { domain: 'Cloud', primary: true },
  'Message queues': { domain: 'Cloud', primary: true },
  SFTP: { domain: 'Cloud' },
  'Sage APIs': { domain: 'Cloud' },
  'Azure Key Vault': { domain: 'Cloud' },
  'Application Insights': { domain: 'Cloud' },
  Datadog: { domain: 'Cloud' },
  PostgreSQL: { domain: 'Databases', primary: true },
  'SQL Server': { domain: 'Databases', primary: true },
  'Stored procedures': { domain: 'Databases', primary: true },
  'CSV/Excel ETL': { domain: 'Databases', primary: true },
  Git: { domain: 'Tools', primary: true },
  Jenkins: { domain: 'Tools' },
  Jira: { domain: 'Tools' },
}

const CATEGORY_FALLBACK: Record<string, SkillDomain> = {
  'Languages & Backend': 'Backend',
  'Langages et backend': 'Backend',
  'Programming Languages': 'Backend',
  Frontend: 'Frontend',
  Backend: 'Backend',
  Databases: 'Databases',
  'Azure & Integration': 'Cloud',
  'Azure et intégration': 'Cloud',
  'Cloud & DevOps': 'Cloud',
  'Data & Reliability': 'Databases',
  'Données et fiabilité': 'Databases',
  Other: 'Tools',
  'Autres outils': 'Tools',
  Tools: 'Tools',
}

// French skill labels that should map like their English counterparts
const SKILL_ALIASES: Record<string, string> = {
  'API REST': 'REST APIs',
  'Files de messages': 'Message queues',
  'API Sage': 'Sage APIs',
  'Procédures stockées': 'Stored procedures',
  'ETL CSV/Excel': 'CSV/Excel ETL',
  Idempotence: 'Idempotency',
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
    const canonicalName = SKILL_ALIASES[skill.name] ?? skill.name
    const meta = SKILL_META[canonicalName]
    const domain =
      meta?.domain ??
      (skill.category ? CATEGORY_FALLBACK[skill.category] : undefined) ??
      'Tools'
    const group = buckets.get(domain)!
    if (meta?.primary) group.primary.push(skill)
    else group.supporting.push(skill)
  }

  return DOMAIN_ORDER.map((domain) => buckets.get(domain)!).filter(
    (g) => g.primary.length + g.supporting.length > 0,
  )
}
