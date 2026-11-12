import { useEffect, useState } from 'react'
import {
  loadWithStaticFallback,
  readApiCache,
  type ApiFallbackReason,
} from '../api'
import { reportApiDown, reportApiUp } from './apiBannerState'
import type { Locale } from '../i18n/types'

/**
 * Seeds from static (and EN cache when present) so first paint is full content.
 * French always uses static site copy; English revalidates against the API.
 * Live success clears the shared API banner; failures report down.
 */
export function useStaticApiResource<T>(
  path: string,
  staticData: T,
  locale: Locale,
): { data: T; fallbackReason: ApiFallbackReason | null } {
  const requestKey = `${locale}:${path}`
  const cached = locale === 'en' ? readApiCache<T>(path) : null
  const [remote, setRemote] = useState<T | null>(null)
  const [resolvedKey, setResolvedKey] = useState<string | null>(null)
  const [fallbackReason, setFallbackReason] = useState<ApiFallbackReason | null>(null)

  useEffect(() => {
    if (locale === 'fr') return

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

  if (locale === 'fr') {
    return { data: staticData, fallbackReason: null }
  }

  // Empty arrays (`[]`) are valid live/cached payloads — only null means "not yet".
  const data =
    resolvedKey === requestKey && remote != null ? remote : (cached ?? staticData)
  const reason = resolvedKey === requestKey ? fallbackReason : null
  return { data, fallbackReason: reason }
}
