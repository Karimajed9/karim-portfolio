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

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${apiBase}${normalized}`
}

/** True when a public API base was baked in at build time (non-empty). */
export function hasConfiguredApiBase(): boolean {
  const raw = import.meta.env.VITE_API_BASE_URL
  return typeof raw === 'string' && raw.length > 0
}
