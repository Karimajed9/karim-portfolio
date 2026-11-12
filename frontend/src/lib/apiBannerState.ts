import { useSyncExternalStore } from 'react'
import type { ApiFallbackReason } from '../api'

/**
 * Shared API banner reason so content fetches and content-revision polls
 * agree: any successful live response clears offline; only a real failure sets it.
 */
let reason: ApiFallbackReason | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function getApiBannerReason(): ApiFallbackReason | null {
  return reason
}

export function reportApiDown(next: ApiFallbackReason = 'offline') {
  if (reason === next) return
  reason = next
  emit()
}

/** Successful content-revision or content fetch — clear warming/offline/loading. */
export function reportApiUp() {
  if (reason == null) return
  reason = null
  emit()
}

export function subscribeApiBanner(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
  }
}

/** Test helper. */
export function resetApiBannerState() {
  reason = null
  emit()
}

export function useApiBannerReason(): ApiFallbackReason | null {
  return useSyncExternalStore(subscribeApiBanner, getApiBannerReason, () => null)
}
