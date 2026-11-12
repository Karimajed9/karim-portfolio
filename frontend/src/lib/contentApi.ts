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
