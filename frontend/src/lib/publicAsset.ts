import { apiUrl } from '../api'

/**
 * Resolve a path under `frontend/public` with Vite `BASE_URL`.
 * Absolute http(s) URLs pass through unchanged for external covers.
 * API-hosted `/media/...` and `/cv/...` paths use the configured API base.
 */
export function publicAssetUrl(path: string | null | undefined): string {
  const raw = (path ?? '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw
  if (raw.startsWith('/media/') || raw.startsWith('/cv/')) {
    return apiUrl(raw)
  }
  if (raw.startsWith('media/') || raw.startsWith('cv/')) {
    return apiUrl(`/${raw}`)
  }
  const cleaned = raw.replace(/^\//, '')
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
  return `${base}${cleaned}`
}

/** Bundled portfolio cover for the Personal Portfolio Platform case study. */
export const PORTFOLIO_COVER_PATH = 'projects/portfolio-cover.png'
