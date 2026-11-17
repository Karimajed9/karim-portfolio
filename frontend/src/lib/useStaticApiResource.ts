import { useEffect, useState } from 'react'
import {
  loadWithStaticFallback,
  readApiCache,
  type ApiFallbackReason,
} from '../api'
import { reportApiDown, reportApiUp } from './apiBannerState'
import type { Locale } from '../i18n/types'

/**
 * Seeds from the last stored API payload so first paint matches the last
 * successful response. Bundled i18n is used only when nothing is stored yet.
 * Both locales revalidate against the bilingual API; views pick EN/FR with fallback.
 * Live success clears the shared API banner; failures report down without
 * swapping a stored payload back to the bundled copy.
 */
export function useStaticApiResource<T>(
  path: string,
  staticData: T,
  locale: Locale,
): { data: T; fallbackReason: ApiFallbackReason | null } {
  const requestKey = `${locale}:${path}`
  const [remote, setRemote] = useState<T | null>(() => readApiCache<T>(path))
  const [resolvedKey, setResolvedKey] = useState<string | null>(null)
  const [fallbackReason, setFallbackReason] = useState<ApiFallbackReason | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadWithStaticFallback<T>(path, staticData, (data, meta) => {
      if (cancelled) return
      // Re-read so an in-flight failure cannot paint bundled i18n over a
      // payload that a successful response already stored (including []).
      const stored = readApiCache<T>(path)
      const next = meta.usingStatic && stored != null ? stored : data
      setRemote(next)
      setResolvedKey(`${locale}:${path}`)
      if (meta.usingStatic) {
        const reason = meta.reason ?? 'offline'
        setFallbackReason(reason)
        reportApiDown(reason, meta.bannerEpoch)
      } else {
        setFallbackReason(null)
        if (meta.live) reportApiUp()
      }
    })

    return () => {
      cancelled = true
    }
  }, [locale, path, staticData])

  // Empty arrays (`[]`) are valid live/cached payloads — only null means "not yet".
  const storedNow = readApiCache<T>(path)
  const data =
    resolvedKey === requestKey && remote != null ? remote : (storedNow ?? staticData)
  const reason = resolvedKey === requestKey ? fallbackReason : null
  return { data, fallbackReason: reason }
}
