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

/** Wire shape of `GET /api/projects` and `GET /api/projects/{slug}`. */
export type ApiProject = {
  id: number
  slug: string
  nameEn: string
  nameFr?: string | null
  summaryEn: string
  summaryFr?: string | null
  tagsEn?: string | null
  tagsFr?: string | null
  href: string
  categoryEn?: string | null
  categoryFr?: string | null
  statusEn?: string | null
  statusFr?: string | null
  coverImageUrl?: string | null
  liveDemoUrl?: string | null
  roleEn?: string | null
  roleFr?: string | null
  overviewEn?: string | null
  overviewFr?: string | null
  problemEn?: string | null
  problemFr?: string | null
  architectureImageUrl?: string | null
  architectureCaptionEn?: string | null
  architectureCaptionFr?: string | null
  featuresEn?: string | null
  featuresFr?: string | null
  tradeoffsEn?: string | null
  tradeoffsFr?: string | null
  challengesEn?: string | null
  challengesFr?: string | null
  testingEn?: string | null
  testingFr?: string | null
  galleryUrls?: string | null
  lessonsEn?: string | null
  lessonsFr?: string | null
  mark?: string | null
  sortOrder?: number | null
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
  slug: string
  name: string
  summary: string
  tags: string[]
  href: string
  mark: string
  category: string
  status: string
  coverImageUrl: string
  liveDemoUrl: string
  role: string
  overview: string
  problem: string
  architectureImageUrl: string
  architectureCaption: string
  features: string[]
  tradeoffs: string[]
  challenges: string[]
  testing: string
  galleryUrls: string[]
  lessons: string[]
  sortOrder: number
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

function localePair(
  value: string,
  locale: Locale,
): { en: string; fr: string } {
  return locale === 'fr' ? { en: '', fr: value } : { en: value, fr: '' }
}

export function buildStaticProjects(
  site: SiteContent,
  locale: Locale = 'en',
): ApiProject[] {
  return site.projects.items.map((item, index) => {
    const name = localePair(item.name, locale)
    const summary = localePair(item.summary, locale)
    const tags = localePair(item.tags.join(','), locale)
    const category = localePair(item.category, locale)
    const status = localePair(item.status, locale)
    const role = localePair(item.role, locale)
    const overview = localePair(item.overview, locale)
    const problem = localePair(item.problem, locale)
    const architectureCaption = localePair(item.architectureCaption, locale)
    const features = localePair(item.features.join('|||'), locale)
    const tradeoffs = localePair(item.tradeoffs.join('|||'), locale)
    const challenges = localePair(item.challenges.join('|||'), locale)
    const testing = localePair(item.testing, locale)
    const lessons = localePair(item.lessons.join('|||'), locale)
    return {
      id: index + 1,
      slug: item.slug,
      nameEn: name.en,
      nameFr: name.fr,
      summaryEn: summary.en,
      summaryFr: summary.fr,
      tagsEn: tags.en,
      tagsFr: tags.fr,
      href: item.href,
      categoryEn: category.en,
      categoryFr: category.fr,
      statusEn: status.en,
      statusFr: status.fr,
      coverImageUrl: item.coverImageUrl,
      liveDemoUrl: item.liveDemoUrl,
      roleEn: role.en,
      roleFr: role.fr,
      overviewEn: overview.en,
      overviewFr: overview.fr,
      problemEn: problem.en,
      problemFr: problem.fr,
      architectureImageUrl: item.architectureImageUrl,
      architectureCaptionEn: architectureCaption.en,
      architectureCaptionFr: architectureCaption.fr,
      featuresEn: features.en,
      featuresFr: features.fr,
      tradeoffsEn: tradeoffs.en,
      tradeoffsFr: tradeoffs.fr,
      challengesEn: challenges.en,
      challengesFr: challenges.fr,
      testingEn: testing.en,
      testingFr: testing.fr,
      galleryUrls: item.galleryUrls.join(','),
      lessonsEn: lessons.en,
      lessonsFr: lessons.fr,
      mark: item.mark,
      sortOrder: index + 1,
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
  slug?: string,
  apiMark?: string | null,
): string {
  if (apiMark && apiMark.trim()) return apiMark.trim()
  const bySlug = slug
    ? staticItems.find((item) => item.slug === slug)
    : undefined
  if (bySlug?.mark) return bySlug.mark
  const hit = staticItems.find((item) => item.name === name)
  if (hit?.mark) return hit.mark
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

export function splitGalleryUrls(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter(Boolean)
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
  return rows
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id)
    .map((row) => {
      const name = pickLocalized(row.nameEn, row.nameFr, locale)
      const slug =
        (row.slug && row.slug.trim()) ||
        staticItems.find((item) => item.name === name)?.slug ||
        `project-${row.id}`
      return {
        id: row.id,
        slug,
        name,
        summary: pickLocalized(row.summaryEn, row.summaryFr, locale),
        tags: splitTags(pickLocalized(row.tagsEn, row.tagsFr, locale)),
        href: row.href ?? '',
        mark: projectMark(name, staticItems, slug, row.mark),
        category: pickLocalized(row.categoryEn, row.categoryFr, locale),
        status: pickLocalized(row.statusEn, row.statusFr, locale),
        coverImageUrl: (row.coverImageUrl ?? '').trim(),
        liveDemoUrl: (row.liveDemoUrl ?? '').trim(),
        role: pickLocalized(row.roleEn, row.roleFr, locale),
        overview: pickLocalized(row.overviewEn, row.overviewFr, locale),
        problem: pickLocalized(row.problemEn, row.problemFr, locale),
        architectureImageUrl: (row.architectureImageUrl ?? '').trim(),
        architectureCaption: pickLocalized(
          row.architectureCaptionEn,
          row.architectureCaptionFr,
          locale,
        ),
        features: splitHighlights(
          pickLocalized(row.featuresEn, row.featuresFr, locale),
        ),
        tradeoffs: splitHighlights(
          pickLocalized(row.tradeoffsEn, row.tradeoffsFr, locale),
        ),
        challenges: splitHighlights(
          pickLocalized(row.challengesEn, row.challengesFr, locale),
        ),
        testing: pickLocalized(row.testingEn, row.testingFr, locale),
        galleryUrls: splitGalleryUrls(row.galleryUrls),
        lessons: splitHighlights(
          pickLocalized(row.lessonsEn, row.lessonsFr, locale),
        ),
        sortOrder: row.sortOrder ?? 0,
      }
    })
}

export function findProjectBySlug(
  projects: ProjectView[],
  slug: string,
): ProjectView | undefined {
  return projects.find((project) => project.slug === slug)
}

export function nextProject(
  projects: ProjectView[],
  slug: string,
): ProjectView | undefined {
  const index = projects.findIndex((project) => project.slug === slug)
  if (index < 0 || projects.length < 2) return undefined
  return projects[(index + 1) % projects.length]
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
