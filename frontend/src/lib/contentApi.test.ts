import { describe, expect, it } from 'vitest'
import { siteEn } from '../i18n/en'
import {
  buildStaticAbout,
  buildStaticExperience,
  buildStaticProjects,
  buildStaticSkills,
  educationYearLabel,
  pickLocalized,
  projectMark,
  splitHighlights,
  splitTags,
  toEducationViews,
  toExperienceViews,
  toProjectViews,
  toSkillGroups,
} from './contentApi'

describe('contentApi adapters', () => {
  it('splits highlights and tags', () => {
    expect(splitHighlights('a|||b ||| ')).toEqual(['a', 'b'])
    expect(splitTags('React, TypeScript,')).toEqual(['React', 'TypeScript'])
  })

  it('picks the active locale and falls back when empty', () => {
    expect(pickLocalized('Hello', 'Bonjour', 'en')).toBe('Hello')
    expect(pickLocalized('Hello', 'Bonjour', 'fr')).toBe('Bonjour')
    expect(pickLocalized('Hello', '', 'fr')).toBe('Hello')
    expect(pickLocalized('', 'Bonjour', 'en')).toBe('Bonjour')
  })

  it('builds static API-shaped seeds from site copy', () => {
    const experience = buildStaticExperience(siteEn, 'en')
    expect(experience[0]?.highlightsEn).toContain('|||')
    expect(experience[0]?.highlightsFr).toBe('')
    expect(toExperienceViews(experience, 'en')[0]?.highlights.length).toBeGreaterThan(0)

    const projects = buildStaticProjects(siteEn, 'en')
    expect(projects[0]?.slug).toBe(siteEn.projects.items[0]?.slug)
    expect(projects[0]?.tagsEn).toContain(',')
    expect(projects[0]?.featuresEn).toContain('|||')
    const view = toProjectViews(projects, siteEn.projects.items, 'en')[0]
    expect(view?.mark).toBe('KM')
    expect(view?.features.length).toBeGreaterThan(0)
    expect(view?.slug).toBe('personal-portfolio-platform')

    const skills = buildStaticSkills(siteEn, 'en')
    expect(skills.length).toBeGreaterThan(0)
    expect(toSkillGroups(skills, 'en')[0]?.category).toBe(siteEn.skills[0]?.category)

    const about = buildStaticAbout(siteEn, 'en')
    expect(toEducationViews(about, 'en')[0]?.degree).toBe(siteEn.about.education[0]?.degree)
  })

  it('derives a mark when the name is unknown', () => {
    expect(projectMark('Alpha Beta', [])).toBe('AB')
    expect(projectMark('Solo', [])).toBe('SO')
  })

  it('groups skills by localized category and sortOrder', () => {
    expect(
      toSkillGroups(
        [
          {
            id: 2,
            categoryEn: 'Cloud',
            categoryFr: 'Nuage',
            nameEn: 'Logic Apps',
            nameFr: 'Logic Apps',
            sortOrder: 2,
          },
          {
            id: 1,
            categoryEn: 'Cloud',
            categoryFr: 'Nuage',
            nameEn: 'Azure Functions',
            nameFr: 'Azure Functions',
            sortOrder: 1,
          },
          {
            id: 3,
            categoryEn: 'Other',
            categoryFr: 'Autre',
            nameEn: 'Git',
            nameFr: 'Git',
            sortOrder: 1,
          },
        ],
        'fr',
      ),
    ).toEqual([
      { category: 'Nuage', items: ['Azure Functions', 'Logic Apps'] },
      { category: 'Autre', items: ['Git'] },
    ])
  })

  it('maps about.education only and derives year labels', () => {
    expect(educationYearLabel('August 2021')).toBe('2021')
    expect(
      toEducationViews(
        {
          summary: 'ignored',
          goals: 'ignored',
          professionalInterests: '',
          personalInterests: '',
          education: [
            {
              id: 1,
              schoolEn: 'Concordia University',
              schoolFr: 'Université Concordia',
              cityEn: 'Montreal',
              cityFr: 'Montréal',
              degreeEn: 'Graduate Diploma in Computer Science',
              degreeFr: 'Diplôme de 2e cycle en informatique',
              countryEn: 'Canada',
              countryFr: 'Canada',
              startDate: 'September 2020',
              endDate: 'August 2021',
            },
          ],
        },
        'fr',
      ),
    ).toEqual([
      {
        id: 1,
        school: 'Université Concordia',
        city: 'Montréal',
        degree: 'Diplôme de 2e cycle en informatique',
        country: 'Canada',
        startDate: 'September 2020',
        endDate: 'August 2021',
        yearLabel: '2021',
      },
    ])
  })
})
