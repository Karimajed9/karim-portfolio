import { getApiBannerEpoch } from './lib/apiBannerState'

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

/**
 * Last successful payload for `path`, including an empty 200 (`[]` or `{}`).
 * Null only when nothing has been stored yet.
 */
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

/**
 * What to show while the API is down or still starting.
 * A stored payload wins, even when it is empty. Bundled i18n is only used
 * when this browser has never stored a successful response for the path.
 */
export function payloadOrBundled<T>(path: string, bundled: T): T {
  const stored = readApiCache<T>(path)
  return stored ?? bundled
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
  /** True only for a successful network response, not a cache seed. */
  live?: boolean
  /** Banner epoch captured when this fallback started. */
  bannerEpoch?: number
}

export type HealthProbeResult = 'ok' | 'timeout' | 'unreachable' | 'cancelled'

/** HTTP status of a failed content request. Null means the connection never completed. */
export class ContentRequestError extends Error {
  readonly status: number | null

  constructor(status: number | null) {
    super(status == null ? 'Content request failed' : `Content request failed (${status})`)
    this.name = 'ContentRequestError'
    this.status = status
  }
}

let healthInflight: Promise<HealthProbeResult> | null = null

/** Test helper. Drops the shared in-flight health probe. */
export function resetHealthProbeCache(): void {
  healthInflight = null
}

async function runHealthProbe(
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<HealthProbeResult> {
  if (signal?.aborted) return 'cancelled'
  const controller = new AbortController()
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(apiUrl('/api/health'), { signal: controller.signal })
    if (!res.ok) return 'unreachable'
    return 'ok'
  } catch (err) {
    if (signal?.aborted) return 'cancelled'
    if (err instanceof Error && err.name === 'AbortError') return 'timeout'
    return 'unreachable'
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

/**
 * One shared /api/health check. Overlapping callers reuse the same request.
 * A caller whose signal is already aborted does not start another probe.
 * 502 and connection refused are `unreachable`. Our timer is `timeout`.
 * An external abort is `cancelled` and is not a confirmed outage.
 */
export async function probeApiHealth(
  timeoutMs = HEALTH_PROBE_MS,
  signal?: AbortSignal,
): Promise<HealthProbeResult> {
  if (signal?.aborted) return 'cancelled'
  if (!healthInflight) {
    const pending = runHealthProbe(timeoutMs).finally(() => {
      if (healthInflight === pending) healthInflight = null
    })
    healthInflight = pending
  }
  const shared = healthInflight
  if (!signal) return shared
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort)
      resolve('cancelled')
    }
    signal.addEventListener('abort', onAbort)
    shared.then(
      (result) => {
        signal.removeEventListener('abort', onAbort)
        resolve(signal.aborted ? 'cancelled' : result)
      },
      (err) => {
        signal.removeEventListener('abort', onAbort)
        reject(err)
      },
    )
  })
}

/**
 * Map a finished health probe to a banner reason.
 * Only a probe that came back down (`unreachable`) is offline.
 * Ok, timer abort, and external cancellation stay on loading.
 */
export function fallbackReasonFromHealth(result: HealthProbeResult): ApiFallbackReason {
  if (result === 'unreachable') return 'offline'
  return 'loading'
}

function reasonAfterHealth(
  health: HealthProbeResult,
  contentFailed: boolean,
  failureStatus: number | null,
): ApiFallbackReason {
  if (health === 'unreachable') return 'offline'
  if (contentFailed && (failureStatus == null || failureStatus === 502)) return 'offline'
  return 'loading'
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
      throw new ContentRequestError(res.status)
    }
    const data = (await res.json()) as T
    writeApiCache(path, data)
    onData(data, 'network')
  } catch (err) {
    if (err instanceof ContentRequestError) throw err
    throw new ContentRequestError(null)
  } finally {
    if (slowTimer != null) clearTimeout(slowTimer)
  }
}

export type LoadWithStaticFallbackOptions = Pick<FetchJsonCachedOptions, 'slowAfterMs'> & {
  healthProbeMs?: number
}

/**
 * Page-loader helper: serve live API data, else the last stored payload, else bundled i18n.
 * - Nothing stored yet + slow network → bundled copy while the request is still pending
 * - A stored payload (including empty 200) stays on screen while the API is starting or down
 * - Health OK, or a cancelled/timed-out probe while content is still in flight → loading
 * - Health 502 / connection refused, or a content 502 / connection refused → offline
 * - Network success (including empty `[]`) → store it, show it, clear the banner
 *
 * The fallback is read again at publish time so a payload stored while this
 * request was in flight is not replaced by the bundled copy captured at the start.
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
  let networkSucceeded = false

  const publishFallback = async (
    preliminary: ApiFallbackReason,
    contentFailed: boolean,
    failureStatus: number | null,
  ) => {
    if (networkSucceeded) return
    const bannerEpoch = getApiBannerEpoch()
    const show = (reason: ApiFallbackReason) => {
      onUpdate(payloadOrBundled(path, staticFallback), {
        usingStatic: true,
        reason,
        bannerEpoch,
      })
    }
    show(preliminary)
    const health = await probeApiHealth(healthProbeMs)
    if (!networkSucceeded) {
      show(reasonAfterHealth(health, contentFailed, failureStatus))
    }
  }

  try {
    await fetchJsonCached<T>(
      path,
      (data, source) => {
        if (source === 'network') {
          networkSucceeded = true
          onUpdate(data, { usingStatic: false, live: true })
          return
        }
        // Cache seed for immediate paint — still waiting on the network.
        onUpdate(data, { usingStatic: false, live: false })
      },
      {
        slowAfterMs: options?.slowAfterMs,
        onSlow: () => {
          // Still in flight: warming, then loading unless health actually came back down.
          void publishFallback('warming', false, null)
        },
      },
    )
  } catch (err) {
    const status = err instanceof ContentRequestError ? err.status : null
    await publishFallback('offline', true, status)
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
