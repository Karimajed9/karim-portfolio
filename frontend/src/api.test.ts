import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  apiBase,
  apiUrl,
  fetchJsonCached,
  readApiCache,
  writeApiCache,
} from './api'

describe('apiUrl', () => {
  it('joins the API base with a rooted path', () => {
    expect(apiUrl('/api/health')).toBe(`${apiBase}/api/health`)
  })

  it('adds a leading slash when the path omits one', () => {
    expect(apiUrl('api/projects')).toBe(`${apiBase}/api/projects`)
  })
})

describe('api cache', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('round-trips sessionStorage cache', () => {
    writeApiCache('/api/projects', [{ id: 1 }])
    expect(readApiCache('/api/projects')).toEqual([{ id: 1 }])
  })

  it('serves cache then network via fetchJsonCached', async () => {
    writeApiCache('/api/skills', [{ id: 1, name: 'cached' }])
    const updates: unknown[] = []

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: 2, name: 'fresh' }],
      }),
    )

    await fetchJsonCached('/api/skills', (data) => updates.push(data))

    expect(updates[0]).toEqual([{ id: 1, name: 'cached' }])
    expect(updates[1]).toEqual([{ id: 2, name: 'fresh' }])
    expect(readApiCache('/api/skills')).toEqual([{ id: 2, name: 'fresh' }])
  })
})
