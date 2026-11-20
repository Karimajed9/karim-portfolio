import { useEffect, useState } from 'react'
import { readCachedMediaObjectUrl, rememberMediaFromNetwork } from '../lib/mediaCache'

type Props = {
  src: string
  /** Used only when `src` cannot be shown and a stored copy is missing. */
  fallbackSrc?: string
  className?: string
  /** Called when neither the stored copy nor `fallbackSrc` can be shown. */
  onUnavailable?: () => void
}

/**
 * Shows an uploaded cover. A copy saved from the last successful API payload
 * is preferred when the API URL fails. The img stays mounted when a fallback
 * URL exists. Callers pass `object-fit: contain` via className.
 */
export default function StableCoverImage({
  src,
  fallbackSrc = '',
  className,
  onUnavailable,
}: Props) {
  const [shown, setShown] = useState(src)
  const [triedCache, setTriedCache] = useState(false)
  const [triedFallback, setTriedFallback] = useState(false)

  useEffect(() => {
    let cancelled = false
    setShown(src)
    setTriedCache(false)
    setTriedFallback(false)
    void readCachedMediaObjectUrl(src).then((cached) => {
      if (!cancelled && cached) setShown(cached)
    })
    return () => {
      cancelled = true
    }
  }, [src])

  return (
    <img
      src={shown}
      alt=""
      className={className}
      onLoad={() => {
        if (shown === src) void rememberMediaFromNetwork(src)
      }}
      onError={() => {
        if (!triedCache) {
          setTriedCache(true)
          void readCachedMediaObjectUrl(src).then((cached) => {
            if (cached) {
              setShown(cached)
              return
            }
            if (fallbackSrc && fallbackSrc !== src) {
              setTriedFallback(true)
              setShown(fallbackSrc)
              return
            }
            onUnavailable?.()
          })
          return
        }
        if (!triedFallback && fallbackSrc && shown !== fallbackSrc) {
          setTriedFallback(true)
          setShown(fallbackSrc)
          return
        }
        onUnavailable?.()
      }}
    />
  )
}
