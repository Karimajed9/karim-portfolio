/**
 * Resolve a path under `frontend/public` with Vite `BASE_URL`.
 * Absolute http(s) URLs pass through unchanged for admin-uploaded/external covers.
 */
export function publicAssetUrl(path: string | null | undefined): string {
  const raw = (path ?? '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw
  const cleaned = raw.replace(/^\//, '')
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
  return `${base}${cleaned}`
}

/** Bundled portfolio cover for the Personal Portfolio Platform case study. */
export const PORTFOLIO_COVER_PATH = 'projects/portfolio-cover.png'
