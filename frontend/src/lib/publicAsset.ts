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

const MARKDOWN_IMAGE = /!\[[^\]]*]\(\s*<?([^)\s>]+)>?(?:\s+["'][^"']*["'])?\s*\)/

/** First image URL embedded in a markdown string, if any. */
export function markdownImageUrl(value: string | null | undefined): string {
  const raw = (value ?? '').trim()
  if (!raw) return ''
  return MARKDOWN_IMAGE.exec(raw)?.[1]?.trim() ?? ''
}

/**
 * Picture URL for a project field. A bare image URL wins. Markdown image
 * syntax is unwrapped so the picture is used instead of the markdown text.
 */
export function preferredImageUrl(value: string | null | undefined): string {
  const raw = (value ?? '').trim()
  if (!raw) return ''
  if (
    /^https?:\/\//i.test(raw) ||
    raw.startsWith('/') ||
    raw.startsWith('data:') ||
    raw.startsWith('media/') ||
    raw.startsWith('cv/') ||
    /^[\w./-]+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(raw)
  ) {
    return raw
  }
  return markdownImageUrl(raw)
}
