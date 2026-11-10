import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  apiBase,
  apiUrl,
  fetchJsonCached,
  loadWithStaticFallback,
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

  afterEach(() => {
    vi.useRealTimers()
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

  it('calls onSlow when fetch exceeds threshold and cache is empty', async () => {
    vi.useFakeTimers()
    const onData = vi.fn()
    const onSlow = vi.fn()

    let resolveFetch!: (value: { ok: boolean; json: () => Promise<unknown> }) => void
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve
          }),
      ),
    )

    const pending = fetchJsonCached('/api/skills', onData, {
      onSlow,
      slowAfterMs: 4000,
    })

    expect(onSlow).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(3999)
    expect(onSlow).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(onSlow).toHaveBeenCalledTimes(1)

    resolveFetch({
      ok: true,
      json: async () => [{ id: 3, name: 'live' }],
    })
    await pending

    expect(onData).toHaveBeenCalledWith([{ id: 3, name: 'live' }])
    expect(readApiCache('/api/skills')).toEqual([{ id: 3, name: 'live' }])
  })

  it('does not call onSlow when sessionStorage cache exists', async () => {
    vi.useFakeTimers()
    writeApiCache('/api/skills', [{ id: 1, name: 'cached' }])
    const onData = vi.fn()
    const onSlow = vi.fn()

    let resolveFetch!: (value: { ok: boolean; json: () => Promise<unknown> }) => void
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve
          }),
      ),
    )

    const pending = fetchJsonCached('/api/skills', onData, {
      onSlow,
      slowAfterMs: 4000,
    })

    await vi.advanceTimersByTimeAsync(5000)
    expect(onSlow).not.toHaveBeenCalled()
    expect(onData).toHaveBeenCalledWith([{ id: 1, name: 'cached' }])

    resolveFetch({
      ok: true,
      json: async () => [{ id: 2, name: 'fresh' }],
    })
    await pending
  })

  it('loadWithStaticFallback shows static on slow then swaps to live', async () => {
    vi.useFakeTimers()
    const updates: Array<{ data: unknown; usingStatic: boolean }> = []
    const staticFallback = [{ id: 0, name: 'static' }]

    let resolveFetch!: (value: { ok: boolean; json: () => Promise<unknown> }) => void
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve
          }),
      ),
    )

    const pending = loadWithStaticFallback(
      '/api/skills',
      staticFallback,
      (data, usingStatic) => updates.push({ data, usingStatic }),
      { slowAfterMs: 4000 },
    )

    await vi.advanceTimersByTimeAsync(4000)
    expect(updates).toEqual([{ data: staticFallback, usingStatic: true }])

    resolveFetch({
      ok: true,
      json: async () => [{ id: 9, name: 'live' }],
    })
    await pending

    expect(updates.at(-1)).toEqual({
      data: [{ id: 9, name: 'live' }],
      usingStatic: false,
    })
    expect(readApiCache('/api/skills')).toEqual([{ id: 9, name: 'live' }])
  })

  it('loadWithStaticFallback keeps static on fetch failure', async () => {
    const updates: Array<{ data: unknown; usingStatic: boolean }> = []
    const staticFallback = [{ id: 0, name: 'static' }]

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    )

    await loadWithStaticFallback('/api/skills', staticFallback, (data, usingStatic) =>
      updates.push({ data, usingStatic }),
    )

    expect(updates).toEqual([{ data: staticFallback, usingStatic: true }])
    expect(readApiCache('/api/skills')).toBeNull()
  })
})
