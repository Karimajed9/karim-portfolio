import { useSyncExternalStore } from 'react'
import type { ApiFallbackReason } from '../api'

/**
 * Shared API banner reason so content fetches and content-revision polls
 * agree: any successful live response clears offline; only a real failure sets it.
 */
let reason: ApiFallbackReason | null = null
let epoch = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function getApiBannerReason(): ApiFallbackReason | null {
  return reason
}

/** Bumps on a live success so an older health probe cannot repaint the banner. */
export function getApiBannerEpoch(): number {
  return epoch
}

export function reportApiDown(next: ApiFallbackReason = 'offline', seenEpoch = epoch) {
  if (seenEpoch !== epoch) return
  if (reason === next) return
  reason = next
  emit()
}

/** Successful content fetch — clear warming/offline/loading and ignore older probes. */
export function reportApiUp() {
  epoch += 1
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
  epoch = 0
  emit()
}

export function useApiBannerReason(): ApiFallbackReason | null {
  return useSyncExternalStore(subscribeApiBanner, getApiBannerReason, () => null)
}
