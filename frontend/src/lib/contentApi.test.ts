import { describe, expect, it } from 'vitest'
import { siteEn } from '../i18n/en'
import {
  buildStaticExperience,
  buildStaticProjects,
  buildStaticSkills,
  projectMark,
  splitHighlights,
  splitTags,
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
})
