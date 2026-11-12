import type { SiteContent } from '../i18n/types'

/** Wire shape of `GET /api/experience`. */
export type ApiExperience = {
  id: number
  company: string
  role: string
  startDate: string
  endDate: string
  location: string
  highlights: string
  sortOrder?: number
}

/** Wire shape of `GET /api/projects`. */
export type ApiProject = {
  id: number
  name: string
  summary: string
  tags: string
  href: string
}

/** Wire shape of `GET /api/skills`. */
export type ApiSkill = {
  id: number
  category: string
  name: string
  sortOrder: number
}

/** Education row inside `GET /api/about`. */
export type ApiEducation = {
  id: number
  school: string
  city: string
  degree: string
  country: string
  startDate: string
  endDate: string
  sortOrder?: number
}

/** Wire shape of `GET /api/about` (only `education` is rendered from this payload). */
export type ApiAbout = {
  summary: string
  goals: string
  professionalInterests: string
  personalInterests: string
  education: ApiEducation[]
}

export type ExperienceView = {
  id: number
  company: string
  role: string
  startDate: string
  endDate: string
  location: string
  highlights: string[]
}

export type ProjectView = {
  id: number
  name: string
  summary: string
  tags: string[]
  href: string
  mark: string
}

export type SkillGroupView = {
  category: string
  items: string[]
}

export type EducationView = {
  id: number
  school: string
  city: string
  degree: string
  country: string
  startDate: string
  endDate: string
  yearLabel: string
}

export function splitHighlights(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split('|||')
    .map((part) => part.trim())
    .filter(Boolean)
}

export function splitTags(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

export function buildStaticExperience(site: SiteContent): ApiExperience[] {
  return site.experience.map((item, index) => ({
    id: index + 1,
    company: item.company,
    role: item.role,
    startDate: item.startDate,
    endDate: item.endDate,
    location: item.location,
    highlights: item.highlights.join('|||'),
    sortOrder: index + 1,
  }))
}

export function buildStaticProjects(site: SiteContent): ApiProject[] {
  return site.projects.items.map((item, index) => ({
    id: index + 1,
    name: item.name,
    summary: item.summary,
    tags: item.tags.join(','),
    href: item.href,
  }))
}

export function buildStaticSkills(site: SiteContent): ApiSkill[] {
  return site.skills.flatMap((group, groupIndex) =>
    group.items.map((name, itemIndex) => ({
      id: groupIndex * 100 + itemIndex + 1,
      category: group.category,
      name,
      sortOrder: itemIndex + 1,
    })),
  )
}

export function buildStaticAbout(site: SiteContent): ApiAbout {
  return {
    summary: site.about.summary,
    goals: site.about.goals,
    professionalInterests: site.about.professionalInterests.join(','),
    personalInterests: site.about.personalInterests.join(','),
    education: site.about.education.map((item, index) => ({
      id: index + 1,
      school: item.school,
      city: item.city,
      degree: item.degree,
      country: item.country,
      startDate: item.startDate,
      endDate: item.endDate,
      sortOrder: index + 1,
    })),
  }
}

export function educationYearLabel(endDate: string, fallback?: string): string {
  if (fallback) return fallback
  const match = endDate.match(/(?:19|20)\d{2}/)
  return match?.[0] ?? endDate
}

export function projectMark(
  name: string,
  staticItems: SiteContent['projects']['items'],
): string {
  const hit = staticItems.find((item) => item.name === name)
  if (hit?.mark) return hit.mark
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

export function toExperienceViews(rows: ApiExperience[]): ExperienceView[] {
  return rows.map((row) => ({
    id: row.id,
    company: row.company,
    role: row.role,
    startDate: row.startDate,
    endDate: row.endDate,
    location: row.location,
    highlights: splitHighlights(row.highlights),
  }))
}

export function toProjectViews(
  rows: ApiProject[],
  staticItems: SiteContent['projects']['items'],
): ProjectView[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    summary: row.summary,
    tags: splitTags(row.tags),
    href: row.href,
    mark: projectMark(row.name, staticItems),
  }))
}

/** Group flat API skills into category rows, preserving first-seen category order. */
export function toSkillGroups(rows: ApiSkill[]): SkillGroupView[] {
  const byCategory = new Map<string, ApiSkill[]>()

  for (const row of rows) {
    const list = byCategory.get(row.category)
    if (list) list.push(row)
    else byCategory.set(row.category, [row])
  }

  return [...byCategory.entries()].map(([category, items]) => ({
    category,
    items: items
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((item) => item.name),
  }))
}

/** Map `/api/about` to education rows only — profile copy stays on bundled site data. */
export function toEducationViews(about: ApiAbout): EducationView[] {
  const rows = about.education ?? []
  return rows.map((row) => ({
    id: row.id,
    school: row.school,
    city: row.city,
    degree: row.degree,
    country: row.country,
    startDate: row.startDate,
    endDate: row.endDate,
    yearLabel: educationYearLabel(row.endDate),
  }))
}
