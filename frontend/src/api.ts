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
/** Keep cached payloads for the browser tab session window (10 minutes). */
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

/** Read a cached GET payload if present (even if slightly stale). */
export function readApiCache<T>(path: string): T | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(path))
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
    const entry: CacheEntry<T> = { at: Date.now(), data }
    sessionStorage.setItem(cacheKey(path), JSON.stringify(entry))
  } catch {
    // Quota / private mode — ignore.
  }
}

/** Default wait before treating a cold API as "slow" (free-tier wake). */
export const SLOW_FETCH_MS = 4000

export type FetchJsonCachedOptions = {
  /** Fired once when the network is still pending after `slowAfterMs` and there was no cache. */
  onSlow?: () => void
  /** Override for tests; defaults to {@link SLOW_FETCH_MS}. */
  slowAfterMs?: number
}

/**
 * Stale-while-revalidate GET helper.
 * Calls `onData` with sessionStorage cache immediately (if any), then fetches
 * the network and calls `onData` again on success (and refreshes the cache).
 * When there is no cache and the fetch exceeds `slowAfterMs`, optionally calls
 * `onSlow` so the UI can show static content while the request continues.
 */
export async function fetchJsonCached<T>(
  path: string,
  onData: (data: T) => void,
  options?: FetchJsonCachedOptions,
): Promise<void> {
  const cached = readApiCache<T>(path)
  if (cached != null) {
    onData(cached)
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
    onData(data)
  } finally {
    if (slowTimer != null) clearTimeout(slowTimer)
  }
}

/**
 * Page-loader helper: serve live/cached API data, or `site.ts` static fallback.
 * - No cache + slow network → `onUpdate(staticFallback, true)` while fetch continues
 * - Success → `onUpdate(live, false)` and writes cache
 * - Failure → `onUpdate(staticFallback, true)` (same as today's error fallback)
 */
export async function loadWithStaticFallback<T>(
  path: string,
  staticFallback: T,
  onUpdate: (data: T, usingStatic: boolean) => void,
  options?: Pick<FetchJsonCachedOptions, 'slowAfterMs'>,
): Promise<void> {
  try {
    await fetchJsonCached<T>(
      path,
      (data) => onUpdate(data, false),
      {
        slowAfterMs: options?.slowAfterMs,
        onSlow: () => onUpdate(staticFallback, true),
      },
    )
  } catch {
    onUpdate(staticFallback, true)
  }
}

/** Exported for tests. */
export function isCacheFresh(path: string, now = Date.now()): boolean {
  try {
    const raw = sessionStorage.getItem(cacheKey(path))
    if (!raw) return false
    const entry = JSON.parse(raw) as CacheEntry<unknown>
    return typeof entry.at === 'number' && now - entry.at < CACHE_TTL_MS
  } catch {
    return false
  }
}
