import type { Locale, SiteContent } from '../i18n/types'

/** Wire shape of `GET /api/experience`. */
export type ApiExperience = {
  id: number
  companyEn: string
  companyFr?: string | null
  roleEn: string
  roleFr?: string | null
  startDate: string
  endDate: string
  locationEn: string
  locationFr?: string | null
  highlightsEn: string
  highlightsFr?: string | null
  sortOrder?: number
}

/** Wire shape of `GET /api/projects`. */
export type ApiProject = {
  id: number
  nameEn: string
  nameFr?: string | null
  summaryEn: string
  summaryFr?: string | null
  tagsEn?: string | null
  tagsFr?: string | null
  href: string
}

/** Wire shape of `GET /api/skills`. */
export type ApiSkill = {
  id: number
  categoryEn: string
  categoryFr?: string | null
  nameEn: string
  nameFr?: string | null
  sortOrder: number
}

/** Education row inside `GET /api/about`. */
export type ApiEducation = {
  id: number
  schoolEn: string
  schoolFr?: string | null
  cityEn: string
  cityFr?: string | null
  degreeEn: string
  degreeFr?: string | null
  countryEn: string
  countryFr?: string | null
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

/** Prefer the active locale; if empty, fall back to the other language. */
export function pickLocalized(
  en: string | null | undefined,
  fr: string | null | undefined,
  locale: Locale,
): string {
  const primary = (locale === 'fr' ? fr : en) ?? ''
  const fallback = (locale === 'fr' ? en : fr) ?? ''
  const trimmedPrimary = primary.trim()
  if (trimmedPrimary) return trimmedPrimary
  return fallback.trim()
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

export function buildStaticExperience(
  site: SiteContent,
  locale: Locale = 'en',
): ApiExperience[] {
  return site.experience.map((item, index) => {
    const company = item.company
    const role = item.role
    const location = item.location
    const highlights = item.highlights.join('|||')
    return {
      id: index + 1,
      companyEn: locale === 'en' ? company : '',
      companyFr: locale === 'fr' ? company : '',
      roleEn: locale === 'en' ? role : '',
      roleFr: locale === 'fr' ? role : '',
      startDate: item.startDate,
      endDate: item.endDate,
      locationEn: locale === 'en' ? location : '',
      locationFr: locale === 'fr' ? location : '',
      highlightsEn: locale === 'en' ? highlights : '',
      highlightsFr: locale === 'fr' ? highlights : '',
      sortOrder: index + 1,
    }
  })
}

export function buildStaticProjects(
  site: SiteContent,
  locale: Locale = 'en',
): ApiProject[] {
  return site.projects.items.map((item, index) => {
    const name = item.name
    const summary = item.summary
    const tags = item.tags.join(',')
    return {
      id: index + 1,
      nameEn: locale === 'en' ? name : '',
      nameFr: locale === 'fr' ? name : '',
      summaryEn: locale === 'en' ? summary : '',
      summaryFr: locale === 'fr' ? summary : '',
      tagsEn: locale === 'en' ? tags : '',
      tagsFr: locale === 'fr' ? tags : '',
      href: item.href,
    }
  })
}

export function buildStaticSkills(
  site: SiteContent,
  locale: Locale = 'en',
): ApiSkill[] {
  return site.skills.flatMap((group, groupIndex) =>
    group.items.map((name, itemIndex) => ({
      id: groupIndex * 100 + itemIndex + 1,
      categoryEn: locale === 'en' ? group.category : '',
      categoryFr: locale === 'fr' ? group.category : '',
      nameEn: locale === 'en' ? name : '',
      nameFr: locale === 'fr' ? name : '',
      sortOrder: itemIndex + 1,
    })),
  )
}

export function buildStaticAbout(
  site: SiteContent,
  locale: Locale = 'en',
): ApiAbout {
  return {
    summary: site.about.summary,
    goals: site.about.goals,
    professionalInterests: site.about.professionalInterests.join(','),
    personalInterests: site.about.personalInterests.join(','),
    education: site.about.education.map((item, index) => ({
      id: index + 1,
      schoolEn: locale === 'en' ? item.school : '',
      schoolFr: locale === 'fr' ? item.school : '',
      cityEn: locale === 'en' ? item.city : '',
      cityFr: locale === 'fr' ? item.city : '',
      degreeEn: locale === 'en' ? item.degree : '',
      degreeFr: locale === 'fr' ? item.degree : '',
      countryEn: locale === 'en' ? item.country : '',
      countryFr: locale === 'fr' ? item.country : '',
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

export function toExperienceViews(
  rows: ApiExperience[],
  locale: Locale = 'en',
): ExperienceView[] {
  return rows.map((row) => ({
    id: row.id,
    company: pickLocalized(row.companyEn, row.companyFr, locale),
    role: pickLocalized(row.roleEn, row.roleFr, locale),
    startDate: row.startDate,
    endDate: row.endDate,
    location: pickLocalized(row.locationEn, row.locationFr, locale),
    highlights: splitHighlights(
      pickLocalized(row.highlightsEn, row.highlightsFr, locale),
    ),
  }))
}

export function toProjectViews(
  rows: ApiProject[],
  staticItems: SiteContent['projects']['items'],
  locale: Locale = 'en',
): ProjectView[] {
  return rows.map((row) => {
    const name = pickLocalized(row.nameEn, row.nameFr, locale)
    return {
      id: row.id,
      name,
      summary: pickLocalized(row.summaryEn, row.summaryFr, locale),
      tags: splitTags(pickLocalized(row.tagsEn, row.tagsFr, locale)),
      href: row.href,
      mark: projectMark(name, staticItems),
    }
  })
}

/** Group flat API skills into category rows, preserving first-seen category order. */
export function toSkillGroups(
  rows: ApiSkill[],
  locale: Locale = 'en',
): SkillGroupView[] {
  const byCategory = new Map<string, ApiSkill[]>()

  for (const row of rows) {
    const category = pickLocalized(row.categoryEn, row.categoryFr, locale)
    if (!category) continue
    const list = byCategory.get(category)
    if (list) list.push(row)
    else byCategory.set(category, [row])
  }

  return [...byCategory.entries()].map(([category, items]) => ({
    category,
    items: items
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((item) => pickLocalized(item.nameEn, item.nameFr, locale))
      .filter(Boolean),
  }))
}

/** Map `/api/about` to education rows only — profile copy stays on bundled site data. */
export function toEducationViews(
  about: ApiAbout,
  locale: Locale = 'en',
): EducationView[] {
  const rows = about.education ?? []
  return rows.map((row) => ({
    id: row.id,
    school: pickLocalized(row.schoolEn, row.schoolFr, locale),
    city: pickLocalized(row.cityEn, row.cityFr, locale),
    degree: pickLocalized(row.degreeEn, row.degreeFr, locale),
    country: pickLocalized(row.countryEn, row.countryFr, locale),
    startDate: row.startDate,
    endDate: row.endDate,
    yearLabel: educationYearLabel(row.endDate),
  }))
}
