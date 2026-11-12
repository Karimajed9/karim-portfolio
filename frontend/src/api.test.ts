import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  apiBase,
  apiUrl,
  fallbackReasonFromHealth,
  fetchJsonCached,
  HEALTH_PROBE_MS,
  loadWithStaticFallback,
  messageForFallbackReason,
  probeApiHealth,
  readApiCache,
  SLOW_FETCH_MS,
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

describe('health probe messaging', () => {
  it('maps probe results to fallback reasons', () => {
    expect(fallbackReasonFromHealth('ok')).toBe('loading')
    expect(fallbackReasonFromHealth('timeout')).toBe('warming')
    expect(fallbackReasonFromHealth('unreachable')).toBe('offline')
  })

  it('exposes distinct copy for each reason', () => {
    expect(messageForFallbackReason('warming')).toMatch(/starting up/i)
    expect(messageForFallbackReason('offline')).toMatch(/can't reach/i)
    expect(messageForFallbackReason('loading')).toMatch(/loading live data/i)
  })
})

describe('api cache', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('round-trips localStorage cache', () => {
    writeApiCache('/api/projects', [{ id: 1 }])
    expect(readApiCache('/api/projects')).toEqual([{ id: 1 }])
  })

  it('migrates matching portfolio-api keys from sessionStorage when local is empty', () => {
    const key = 'portfolio-api:/api/projects'
    const entry = JSON.stringify({ at: Date.now(), data: [{ id: 7 }] })
    sessionStorage.setItem(key, entry)

    expect(readApiCache('/api/projects')).toEqual([{ id: 7 }])
    expect(localStorage.getItem(key)).toBe(entry)
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
      slowAfterMs: SLOW_FETCH_MS,
    })

    expect(onSlow).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(SLOW_FETCH_MS - 1)
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

  it('does not call onSlow when localStorage cache exists', async () => {
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
      slowAfterMs: SLOW_FETCH_MS,
    })

    await vi.advanceTimersByTimeAsync(SLOW_FETCH_MS + 1000)
    expect(onSlow).not.toHaveBeenCalled()
    expect(onData).toHaveBeenCalledWith([{ id: 1, name: 'cached' }])

    resolveFetch({
      ok: true,
      json: async () => [{ id: 2, name: 'fresh' }],
    })
    await pending
  })

  it('probeApiHealth returns timeout when the request hangs', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const err = new Error('Aborted')
            err.name = 'AbortError'
            reject(err)
          })
        })
      }),
    )

    const pending = probeApiHealth(HEALTH_PROBE_MS)
    await vi.advanceTimersByTimeAsync(HEALTH_PROBE_MS)
    await expect(pending).resolves.toBe('timeout')
  })

  it('probeApiHealth returns unreachable on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(probeApiHealth(50)).resolves.toBe('unreachable')
  })

  it('loadWithStaticFallback shows warming on slow hang then swaps to live', async () => {
    vi.useFakeTimers()
    const updates: Array<{ data: unknown; meta: { usingStatic: boolean; reason?: string } }> = []
    const staticFallback = [{ id: 0, name: 'static' }]

    let resolveSkills!: (value: { ok: boolean; json: () => Promise<unknown> }) => void
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        if (url.includes('/api/health')) {
          return new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
              const err = new Error('Aborted')
              err.name = 'AbortError'
              reject(err)
            })
          })
        }
        return new Promise((resolve) => {
          resolveSkills = resolve
        })
      }),
    )

    const pending = loadWithStaticFallback(
      '/api/skills',
      staticFallback,
      (data, meta) => updates.push({ data, meta }),
      { slowAfterMs: SLOW_FETCH_MS, healthProbeMs: HEALTH_PROBE_MS },
    )

    await vi.advanceTimersByTimeAsync(SLOW_FETCH_MS)
    expect(updates[0]).toEqual({
      data: staticFallback,
      meta: { usingStatic: true, reason: 'warming' },
    })

    await vi.advanceTimersByTimeAsync(HEALTH_PROBE_MS)
    expect(updates.at(-1)?.meta).toEqual({ usingStatic: true, reason: 'warming' })

    resolveSkills({
      ok: true,
      json: async () => [{ id: 9, name: 'live' }],
    })
    await pending

    expect(updates.at(-1)).toEqual({
      data: [{ id: 9, name: 'live' }],
      meta: { usingStatic: false },
    })
    expect(readApiCache('/api/skills')).toEqual([{ id: 9, name: 'live' }])
  })

  it('loadWithStaticFallback marks offline when health is unreachable', async () => {
    const updates: Array<{ data: unknown; meta: { usingStatic: boolean; reason?: string } }> = []
    const staticFallback = [{ id: 0, name: 'static' }]

    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/health')) {
          return Promise.reject(new TypeError('Failed to fetch'))
        }
        return Promise.resolve({ ok: false, status: 503 })
      }),
    )

    await loadWithStaticFallback('/api/skills', staticFallback, (data, meta) =>
      updates.push({ data, meta }),
    )

    expect(updates.at(-1)).toEqual({
      data: staticFallback,
      meta: { usingStatic: true, reason: 'offline' },
    })
    expect(readApiCache('/api/skills')).toBeNull()
  })

  it('loadWithStaticFallback uses loading when health is fast but content fails', async () => {
    const updates: Array<{ data: unknown; meta: { usingStatic: boolean; reason?: string } }> = []
    const staticFallback = [{ id: 0, name: 'static' }]

    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/health')) {
          return Promise.resolve({ ok: true, json: async () => ({ status: 'ok' }) })
        }
        return Promise.resolve({ ok: false, status: 503 })
      }),
    )

    await loadWithStaticFallback('/api/skills', staticFallback, (data, meta) =>
      updates.push({ data, meta }),
    )

    expect(updates.at(-1)).toEqual({
      data: staticFallback,
      meta: { usingStatic: true, reason: 'loading' },
    })
  })

  it('loadWithStaticFallback treats empty 200 arrays as live success', async () => {
    const updates: Array<{ data: unknown; meta: { usingStatic: boolean; reason?: string } }> = []
    const staticFallback = [{ id: 0, name: 'static' }]

    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/health')) {
          return Promise.resolve({ ok: true, json: async () => ({ status: 'ok' }) })
        }
        return Promise.resolve({ ok: true, json: async () => [] })
      }),
    )

    await loadWithStaticFallback('/api/projects', staticFallback, (data, meta) =>
      updates.push({ data, meta }),
    )

    expect(updates.at(-1)).toEqual({
      data: [],
      meta: { usingStatic: false },
    })
    expect(readApiCache('/api/projects')).toEqual([])
  })
})
