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

/**
 * Stale-while-revalidate GET helper.
 * Calls `onData` with sessionStorage cache immediately (if any), then fetches
 * the network and calls `onData` again on success (and refreshes the cache).
 */
export async function fetchJsonCached<T>(
  path: string,
  onData: (data: T) => void,
): Promise<void> {
  const cached = readApiCache<T>(path)
  if (cached != null) {
    onData(cached)
  }

  const res = await fetch(apiUrl(path))
  if (!res.ok) {
    throw new Error(`Failed to load ${path}`)
  }
  const data = (await res.json()) as T
  writeApiCache(path, data)
  onData(data)
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
