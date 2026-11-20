import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getApiBannerReason, reportApiUp, resetApiBannerState } from './lib/apiBannerState'
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
  resetHealthProbeCache,
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
    expect(fallbackReasonFromHealth('timeout')).toBe('loading')
    expect(fallbackReasonFromHealth('cancelled')).toBe('loading')
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
    resetHealthProbeCache()
    resetApiBannerState()
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

  it('labels cache vs network sources for fetchJsonCached', async () => {
    writeApiCache('/api/skills', [{ id: 1, name: 'cached' }])
    const sources: string[] = []

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: 2, name: 'fresh' }],
      }),
    )

    await fetchJsonCached('/api/skills', (_data, source) => sources.push(source))
    expect(sources).toEqual(['cache', 'network'])
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

    expect(onData).toHaveBeenCalledWith([{ id: 3, name: 'live' }], 'network')
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
    expect(onData).toHaveBeenCalledWith([{ id: 1, name: 'cached' }], 'cache')

    resolveFetch({
      ok: true,
      json: async () => [{ id: 2, name: 'fresh' }],
    })
    await pending
  })

  it('loadWithStaticFallback still banners offline when cache exists but network fails', async () => {
    writeApiCache('/api/experience', [{ id: 1, name: 'cached' }])
    const updates: Array<{ data: unknown; meta: { usingStatic: boolean; reason?: string } }> = []
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/api/health')) {
        return Promise.reject(new TypeError('Failed to fetch'))
      }
      return Promise.reject(new TypeError('Failed to fetch'))
    })
    vi.stubGlobal('fetch', fetchMock)

    await loadWithStaticFallback(
      '/api/experience',
      [{ id: 0, name: 'static' }],
      (data, meta) => updates.push({ data, meta }),
    )

    expect(updates.some((u) => u.meta.reason === 'offline')).toBe(true)
    expect(updates.at(-1)?.data).toEqual([{ id: 1, name: 'cached' }])
    expect(updates.at(-1)?.meta).toEqual(
      expect.objectContaining({ usingStatic: true, reason: 'offline' }),
    )
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes('/api/health'))).toBe(
      true,
    )
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

  it('loadWithStaticFallback shows warming while slow then loading when health is reachable', async () => {
    vi.useFakeTimers()
    const updates: Array<{ data: unknown; meta: { usingStatic: boolean; reason?: string } }> = []
    const staticFallback = [{ id: 0, name: 'static' }]

    let resolveSkills!: (value: { ok: boolean; json: () => Promise<unknown> }) => void
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/health')) {
          return Promise.resolve({ ok: true, json: async () => ({ status: 'ok' }) })
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
    expect(updates[0]?.data).toEqual(staticFallback)
    expect(updates[0]?.meta).toEqual(
      expect.objectContaining({ usingStatic: true, reason: 'warming' }),
    )

    await Promise.resolve()
    expect(updates.at(-1)?.meta).toEqual(
      expect.objectContaining({ usingStatic: true, reason: 'loading' }),
    )

    resolveSkills({
      ok: true,
      json: async () => [{ id: 9, name: 'live' }],
    })
    await pending

    expect(updates.at(-1)).toEqual({
      data: [{ id: 9, name: 'live' }],
      meta: { usingStatic: false, live: true },
    })
    expect(readApiCache('/api/skills')).toEqual([{ id: 9, name: 'live' }])
  })

  it('loadWithStaticFallback shows loading while the first request is in flight', async () => {
    let resolveSkills!: (value: { ok: boolean; json: () => Promise<unknown> }) => void
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveSkills = resolve
          }),
      ),
    )

    const pending = loadWithStaticFallback('/api/skills', [{ id: 0, name: 'static' }], () => {})
    expect(getApiBannerReason()).toBe('loading')
    reportApiUp()
    expect(getApiBannerReason()).toBe('loading')

    resolveSkills({
      ok: true,
      json: async () => [{ id: 9, name: 'live' }],
    })
    await pending
    expect(getApiBannerReason()).toBeNull()
  })

  it('loadWithStaticFallback keeps loading when the health probe is cancelled', async () => {
    vi.useFakeTimers()
    const updates: Array<{ data: unknown; meta: { usingStatic: boolean; reason?: string } }> = []
    const staticFallback = [{ id: 0, name: 'static' }]

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
        return Promise.resolve({ ok: false, status: 502 })
      }),
    )

    const pending = loadWithStaticFallback(
      '/api/skills',
      staticFallback,
      (data, meta) => updates.push({ data, meta }),
      { healthProbeMs: HEALTH_PROBE_MS },
    )

    await vi.advanceTimersByTimeAsync(HEALTH_PROBE_MS)
    await pending

    expect(updates.at(-1)?.data).toEqual(staticFallback)
    expect(updates.at(-1)?.meta).toEqual(
      expect.objectContaining({ usingStatic: true, reason: 'loading' }),
    )
  })

  it('reuses one health probe when several sections fail together', async () => {
    let healthCalls = 0
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/health')) {
          healthCalls += 1
          return Promise.reject(new TypeError('Failed to fetch'))
        }
        return Promise.resolve({ ok: false, status: 502, json: async () => null })
      }),
    )

    await Promise.all([
      loadWithStaticFallback('/api/projects', [], () => {}),
      loadWithStaticFallback('/api/experience', [], () => {}),
      loadWithStaticFallback('/api/skills', [], () => {}),
      loadWithStaticFallback('/api/about', {}, () => {}),
    ])

    expect(healthCalls).toBe(1)
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

    expect(updates.at(-1)?.data).toEqual(staticFallback)
    expect(updates.at(-1)?.meta).toEqual(
      expect.objectContaining({ usingStatic: true, reason: 'offline' }),
    )
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

    expect(updates.at(-1)?.data).toEqual(staticFallback)
    expect(updates.at(-1)?.meta).toEqual(
      expect.objectContaining({ usingStatic: true, reason: 'loading' }),
    )
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
      meta: { usingStatic: false, live: true },
    })
    expect(readApiCache('/api/projects')).toEqual([])
  })

  it('keeps a payload stored while the API is starting instead of the bundled copy', async () => {
    vi.useFakeTimers()
    const updates: Array<{ data: unknown; meta: { usingStatic: boolean; reason?: string } }> = []
    const bundled = [{ id: 0, name: 'bundled' }]
    const stored = [{ id: 5, name: 'saved project' }]
    let finishContent: (value: { ok: boolean; json: () => Promise<unknown> }) => void = () => {}

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
          finishContent = resolve
        })
      }),
    )

    const pending = loadWithStaticFallback(
      '/api/projects',
      bundled,
      (data, meta) => updates.push({ data, meta }),
      { slowAfterMs: SLOW_FETCH_MS, healthProbeMs: HEALTH_PROBE_MS },
    )

    await vi.advanceTimersByTimeAsync(SLOW_FETCH_MS)
    expect(updates[0]?.data).toEqual(bundled)
    expect(updates[0]?.meta).toEqual(
      expect.objectContaining({ usingStatic: true, reason: 'warming' }),
    )

    writeApiCache('/api/projects', stored)
    await vi.advanceTimersByTimeAsync(HEALTH_PROBE_MS)

    expect(updates.at(-1)?.data).toEqual(stored)
    expect(updates.at(-1)?.meta).toEqual(
      expect.objectContaining({ usingStatic: true, reason: 'loading' }),
    )

    finishContent({ ok: true, json: async () => stored })
    await pending
    expect(updates.at(-1)).toEqual({
      data: stored,
      meta: { usingStatic: false, live: true },
    })
  })

  it('uses an empty 200 as the fallback when a later request cannot reach the API', async () => {
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
    await loadWithStaticFallback('/api/experience', [{ id: 0, name: 'bundled' }], () => {})

    const updates: Array<{ data: unknown; meta: { usingStatic: boolean; reason?: string } }> = []
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await loadWithStaticFallback(
      '/api/experience',
      [{ id: 0, name: 'bundled' }],
      (data, meta) => updates.push({ data, meta }),
    )

    expect(updates.at(-1)?.data).toEqual([])
    expect(updates.at(-1)?.meta).toEqual(
      expect.objectContaining({ usingStatic: true, reason: 'offline' }),
    )
  })
})
