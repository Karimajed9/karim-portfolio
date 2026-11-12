import { describe, expect, it } from 'vitest'
import { siteEn } from '../i18n/en'
import {
  buildStaticExperience,
  buildStaticProjects,
  projectMark,
  splitHighlights,
  splitTags,
  toExperienceViews,
  toProjectViews,
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
  })

  it('derives a mark when the name is unknown', () => {
    expect(projectMark('Alpha Beta', [])).toBe('AB')
    expect(projectMark('Solo', [])).toBe('SO')
  })
})
