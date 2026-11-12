import { useEffect, useState } from 'react'
import {
  loadWithStaticFallback,
  readApiCache,
  type ApiFallbackReason,
} from '../api'
import { reportApiDown, reportApiUp } from './apiBannerState'
import type { Locale } from '../i18n/types'

/**
 * Seeds from static (and cache when present) so first paint is full content.
 * Both locales revalidate against the bilingual API; views pick EN/FR with fallback.
 * Live success clears the shared API banner; failures report down.
 */
export function useStaticApiResource<T>(
  path: string,
  staticData: T,
  locale: Locale,
): { data: T; fallbackReason: ApiFallbackReason | null } {
  const requestKey = `${locale}:${path}`
  const cached = readApiCache<T>(path)
  const [remote, setRemote] = useState<T | null>(null)
  const [resolvedKey, setResolvedKey] = useState<string | null>(null)
  const [fallbackReason, setFallbackReason] = useState<ApiFallbackReason | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadWithStaticFallback<T>(path, staticData, (data, meta) => {
      if (!cancelled) {
        setRemote(data)
        setResolvedKey(`${locale}:${path}`)
        if (meta.usingStatic) {
          const reason = meta.reason ?? 'offline'
          setFallbackReason(reason)
          reportApiDown(reason)
        } else {
          setFallbackReason(null)
          reportApiUp()
        }
      }
    })

    return () => {
      cancelled = true
    }
  }, [locale, path, staticData])

  // Empty arrays (`[]`) are valid live/cached payloads — only null means "not yet".
  const data =
    resolvedKey === requestKey && remote != null ? remote : (cached ?? staticData)
  const reason = resolvedKey === requestKey ? fallbackReason : null
  return { data, fallbackReason: reason }
}
