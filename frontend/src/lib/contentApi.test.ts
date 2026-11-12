import { describe, expect, it } from 'vitest'
import { siteEn } from '../i18n/en'
import {
  buildStaticAbout,
  buildStaticExperience,
  buildStaticProjects,
  buildStaticSkills,
  educationYearLabel,
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

  it('builds static API-shaped seeds from site copy', () => {
    const experience = buildStaticExperience(siteEn)
    expect(experience[0]?.highlights).toContain('|||')
    expect(toExperienceViews(experience)[0]?.highlights.length).toBeGreaterThan(0)

    const projects = buildStaticProjects(siteEn)
    expect(projects[0]?.tags).toContain(',')
    expect(toProjectViews(projects, siteEn.projects.items)[0]?.mark).toBe('KM')

    const skills = buildStaticSkills(siteEn)
    expect(skills.length).toBeGreaterThan(0)
    expect(toSkillGroups(skills)[0]?.category).toBe(siteEn.skills[0]?.category)

    const about = buildStaticAbout(siteEn)
    expect(toEducationViews(about)[0]?.degree).toBe(siteEn.about.education[0]?.degree)
  })

  it('derives a mark when the name is unknown', () => {
    expect(projectMark('Alpha Beta', [])).toBe('AB')
    expect(projectMark('Solo', [])).toBe('SO')
  })

  it('groups skills by category and sortOrder', () => {
    expect(
      toSkillGroups([
        { id: 2, category: 'Cloud', name: 'Logic Apps', sortOrder: 2 },
        { id: 1, category: 'Cloud', name: 'Azure Functions', sortOrder: 1 },
        { id: 3, category: 'Other', name: 'Git', sortOrder: 1 },
      ]),
    ).toEqual([
      { category: 'Cloud', items: ['Azure Functions', 'Logic Apps'] },
      { category: 'Other', items: ['Git'] },
    ])
  })

  it('maps about.education only and derives year labels', () => {
    expect(educationYearLabel('August 2021')).toBe('2021')
    expect(
      toEducationViews({
        summary: 'ignored',
        goals: 'ignored',
        professionalInterests: '',
        personalInterests: '',
        education: [
          {
            id: 1,
            school: 'Concordia University',
            city: 'Montréal',
            degree: 'Graduate Diploma in Computer Science',
            country: 'Canada',
            startDate: 'September 2020',
            endDate: 'August 2021',
          },
        ],
      }),
    ).toEqual([
      {
        id: 1,
        school: 'Concordia University',
        city: 'Montréal',
        degree: 'Graduate Diploma in Computer Science',
        country: 'Canada',
        startDate: 'September 2020',
        endDate: 'August 2021',
        yearLabel: '2021',
      },
    ])
  })
})
