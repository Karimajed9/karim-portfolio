import { describe, expect, it } from 'vitest'
import { PORTFOLIO_COVER_PATH, publicAssetUrl } from './publicAsset'

describe('publicAssetUrl', () => {
  it('keeps relative public paths under the Vite base', () => {
    const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
    expect(publicAssetUrl(PORTFOLIO_COVER_PATH)).toBe(
      `${base}projects/portfolio-cover.png`,
    )
    expect(publicAssetUrl('/projects/portfolio-cover.png')).toBe(
      `${base}projects/portfolio-cover.png`,
    )
  })

  it('leaves absolute http(s) URLs unchanged', () => {
    expect(publicAssetUrl('https://cdn.example.com/cover.png')).toBe(
      'https://cdn.example.com/cover.png',
    )
  })

  it('routes API media paths through the API base', () => {
    expect(publicAssetUrl('/media/uploads/cover.png')).toMatch(/\/media\/uploads\/cover\.png$/)
  })
})
