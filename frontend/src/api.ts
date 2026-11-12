/**
 * API origin for fetch calls.
 * - Local Vite (`npm run dev`): defaults to http://localhost:8080
 * - Docker image build: VITE_API_BASE_URL="" so requests are same-origin `/api/...`
 *   and nginx proxies them to the backend service.
 * - GitHub Pages: set repo Actions variable VITE_API_BASE_URL to the public API
 *   (e.g. https://karim-portfolio-api.onrender.com). If unset/empty, relative
 *   `/api/...` calls fail and pages fall back to static `site.ts` content.
 */
export const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const CACHE_PREFIX = 'portfolio-api:'
/** Keep cached payloads fresh for 10 minutes (stale entries still served for SWR). */
const CACHE_TTL_MS = 10 * 60 * 1000

type CacheEntry<T> = {
  at: number
  data: T
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${apiBase}${normalized}`
}

/** True when a public API base was baked in at build time (non-empty). */
export function hasConfiguredApiBase(): boolean {
  const raw = import.meta.env.VITE_API_BASE_URL
  return typeof raw === 'string' && raw.length > 0
}

function cacheKey(path: string): string {
  return `${CACHE_PREFIX}${path}`
}

/**
 * Copy matching portfolio-api keys from sessionStorage into localStorage when
 * local is still empty (one-time upgrade path from the old tab-scoped cache).
 */
function migrateSessionCacheToLocal(): void {
  try {
    const keys: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key?.startsWith(CACHE_PREFIX)) keys.push(key)
    }
    if (keys.length === 0) return

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(CACHE_PREFIX)) return
    }

    for (const key of keys) {
      const value = sessionStorage.getItem(key)
      if (value != null) localStorage.setItem(key, value)
    }
  } catch {
    // Quota / private mode — ignore.
  }
}

/** Read a cached GET payload if present (even if slightly stale). */
export function readApiCache<T>(path: string): T | null {
  try {
    migrateSessionCacheToLocal()
    const raw = localStorage.getItem(cacheKey(path))
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (!entry || typeof entry.at !== 'number') return null
    return entry.data
  } catch {
    return null
  }
}

export function writeApiCache<T>(path: string, data: T): void {
  try {
    migrateSessionCacheToLocal()
    const entry: CacheEntry<T> = { at: Date.now(), data }
    localStorage.setItem(cacheKey(path), JSON.stringify(entry))
  } catch {
    // Quota / private mode — ignore.
  }
}

/** Default wait before treating a cold API as "slow" (free-tier wake). */
export const SLOW_FETCH_MS = 1500

/** Short probe window for /api/health to tell reachable vs offline. */
export const HEALTH_PROBE_MS = 800

export type FetchJsonCachedOptions = {
  /** Fired once when the network is still pending after `slowAfterMs` and there was no cache. */
  onSlow?: () => void
  /** Override for tests; defaults to {@link SLOW_FETCH_MS}. */
  slowAfterMs?: number
}

export type ApiFallbackReason = 'warming' | 'offline' | 'loading'

export type StaticLoadMeta = {
  usingStatic: boolean
  /** Present when usingStatic is true. */
  reason?: ApiFallbackReason
}

export type HealthProbeResult = 'ok' | 'timeout' | 'unreachable'

/**
 * Quick /api/health check used to distinguish reachable vs down.
 * 502 / connection refused / abort / cancel → unreachable-style results that
 * map to offline. A probe timeout is not treated as a healthy cold start.
 */
export async function probeApiHealth(
  timeoutMs = HEALTH_PROBE_MS,
): Promise<HealthProbeResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(apiUrl('/api/health'), { signal: controller.signal })
    // Non-OK (e.g. 502) means the API edge is up but the app is not healthy.
    if (!res.ok) return 'unreachable'
    return 'ok'
  } catch (err) {
    // AbortError covers our probe timer and browser/proxy cancellation.
    if (err instanceof Error && err.name === 'AbortError') return 'timeout'
    return 'unreachable'
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Map health probe → banner reason.
 * Warming is only used while a content request is still slow/pending (onSlow);
 * a failed or cancelled health check is offline, not warming.
 */
export function fallbackReasonFromHealth(result: HealthProbeResult): ApiFallbackReason {
  if (result === 'ok') return 'loading'
  // timeout (cancelled/aborted) and unreachable (502, refused, network) → down
  return 'offline'
}

export function messageForFallbackReason(reason: ApiFallbackReason): string {
  switch (reason) {
    case 'warming':
      return 'The API is starting up. Showing saved site content for now.'
    case 'offline':
      return "Can't reach the API. Showing saved site content."
    case 'loading':
      return 'Loading live data. Showing saved site content for a moment.'
  }
}

export type FetchJsonSource = 'cache' | 'network'

/**
 * Stale-while-revalidate GET helper.
 * Calls `onData` with localStorage cache immediately (if any), then fetches
 * the network and calls `onData` again on success (and refreshes the cache).
 * When there is no cache and the fetch exceeds `slowAfterMs`, optionally calls
 * `onSlow` so the UI can show static content while the request continues.
 */
export async function fetchJsonCached<T>(
  path: string,
  onData: (data: T, source: FetchJsonSource) => void,
  options?: FetchJsonCachedOptions,
): Promise<void> {
  const cached = readApiCache<T>(path)
  if (cached != null) {
    onData(cached, 'cache')
  }

  const slowAfterMs = options?.slowAfterMs ?? SLOW_FETCH_MS
  let slowTimer: ReturnType<typeof setTimeout> | undefined
  if (cached == null && options?.onSlow) {
    slowTimer = setTimeout(() => {
      options.onSlow?.()
    }, slowAfterMs)
  }

  try {
    const res = await fetch(apiUrl(path))
    if (!res.ok) {
      throw new Error(`Failed to load ${path}`)
    }
    const data = (await res.json()) as T
    writeApiCache(path, data)
    onData(data, 'network')
  } finally {
    if (slowTimer != null) clearTimeout(slowTimer)
  }
}

export type LoadWithStaticFallbackOptions = Pick<FetchJsonCachedOptions, 'slowAfterMs'> & {
  healthProbeMs?: number
}

/**
 * Page-loader helper: serve live/cached API data, or `site.ts` static fallback.
 * - No cache + slow network → static + warming while the request is still pending
 * - Health OK while content still pending → loading (reachable, just slow)
 * - Health 502 / refused / cancelled / timed out → offline
 * - Content 502 / network error → offline (refined by health as above)
 * - Network success (including empty `[]`) → live meta, no banner
 *
 * Important: a cache hit must not count as "live settled". Otherwise a later
 * connection-refused/502 never probes /api/health or shows the offline banner.
 */
export async function loadWithStaticFallback<T>(
  path: string,
  staticFallback: T,
  onUpdate: (data: T, meta: StaticLoadMeta) => void,
  options?: LoadWithStaticFallbackOptions,
): Promise<void> {
  const healthProbeMs = options?.healthProbeMs ?? HEALTH_PROBE_MS
  const cached = readApiCache<T>(path)
  const fallbackData = cached ?? staticFallback
  let networkSucceeded = false

  const publishFallback = async (preliminary: ApiFallbackReason) => {
    if (networkSucceeded) return
    onUpdate(fallbackData, { usingStatic: true, reason: preliminary })
    const health = await probeApiHealth(healthProbeMs)
    if (!networkSucceeded) {
      onUpdate(fallbackData, {
        usingStatic: true,
        reason: fallbackReasonFromHealth(health),
      })
    }
  }

  try {
    await fetchJsonCached<T>(
      path,
      (data, source) => {
        if (source === 'network') {
          networkSucceeded = true
          onUpdate(data, { usingStatic: false })
          return
        }
        // Cache seed for immediate paint — still waiting on the network.
        onUpdate(data, { usingStatic: false })
      },
      {
        slowAfterMs: options?.slowAfterMs,
        onSlow: () => {
          // Optimistic warming only while the content request is still in flight.
          void publishFallback('warming')
        },
      },
    )
  } catch {
    await publishFallback('offline')
  }
}

/** Exported for tests. */
export function isCacheFresh(path: string, now = Date.now()): boolean {
  try {
    migrateSessionCacheToLocal()
    const raw = localStorage.getItem(cacheKey(path))
    if (!raw) return false
    const entry = JSON.parse(raw) as CacheEntry<unknown>
    return typeof entry.at === 'number' && now - entry.at < CACHE_TTL_MS
  } catch {
    return false
  }
}
