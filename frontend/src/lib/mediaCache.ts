import { publicAssetUrl } from './publicAsset'

const CACHE_NAME = 'portfolio-media'

/** `/media/...` path from a stored cover or an absolute API URL. */
export function mediaPath(value: string | null | undefined): string {
  const raw = (value ?? '').trim()
  if (!raw) return ''
  if (raw.startsWith('/media/')) return raw.split(/[?#]/)[0] ?? ''
  try {
    const url = new URL(raw)
    if (url.pathname.startsWith('/media/')) return url.pathname
  } catch {
    // Not an absolute URL.
  }
  return ''
}

function lookupKeys(src: string): string[] {
  const keys = new Set<string>()
  const trimmed = src.trim()
  if (trimmed) keys.add(trimmed)
  const path = mediaPath(trimmed)
  if (!path) return [...keys]
  keys.add(publicAssetUrl(path))
  if (typeof window !== 'undefined') {
    keys.add(new URL(path, window.location.origin).href)
  }
  return [...keys]
}

async function openCache(): Promise<Cache | null> {
  try {
    if (typeof caches === 'undefined') return null
    return await caches.open(CACHE_NAME)
  } catch {
    return null
  }
}

async function putBlob(src: string, blob: Blob, contentType?: string): Promise<void> {
  const cache = await openCache()
  if (!cache) return
  const headers = new Headers()
  if (contentType) headers.set('Content-Type', contentType)
  const response = new Response(blob, { status: 200, headers })
  for (const key of lookupKeys(src)) {
    try {
      await cache.put(key, response.clone())
    } catch {
      // Some hosts reject a non-http cache key. The absolute URL is enough.
    }
  }
}

/** Keep the file the admin just uploaded, keyed by the URL the API returned. */
export function rememberUploadedMedia(url: string, file: Blob): void {
  void putBlob(url, file, file.type)
}

/** Fetch a media URL while the API is up and keep the bytes for the next outage. */
export async function rememberMediaFromNetwork(src: string): Promise<void> {
  const cache = await openCache()
  if (!cache || !src) return
  try {
    if (await cache.match(src)) return
    const res = await fetch(src)
    if (!res.ok) return
    const blob = await res.blob()
    await putBlob(src, blob, blob.type)
  } catch {
    // CORS or a down API. A copy stored earlier still serves.
  }
}

function collectMedia(value: unknown, out: Set<string>): void {
  if (typeof value === 'string') {
    const path = mediaPath(value)
    if (path) out.add(path)
    const embedded = value.match(/\/media\/uploads\/[^\s)"']+/g) ?? []
    for (const item of embedded) {
      const found = mediaPath(item)
      if (found) out.add(found)
    }
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) collectMedia(item, out)
    return
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectMedia(item, out)
  }
}

/** After a live payload is stored, copy every `/media/...` URL it names. */
export function rememberPayloadMedia(data: unknown): void {
  const paths = new Set<string>()
  collectMedia(data, paths)
  for (const path of paths) {
    void rememberMediaFromNetwork(publicAssetUrl(path))
  }
}

/** Object URL for a cover saved while the API was up, or null. */
export async function readCachedMediaObjectUrl(src: string): Promise<string | null> {
  const cache = await openCache()
  if (!cache || !src) return null
  for (const key of lookupKeys(src)) {
    try {
      const match = await cache.match(key)
      if (!match) continue
      const blob = await match.blob()
      if (blob.size === 0) continue
      return URL.createObjectURL(blob)
    } catch {
      // Try the next key.
    }
  }
  return null
}
