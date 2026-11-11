import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  tone?: 'neutral' | 'error' | 'success'
  role?: 'status' | 'alert'
  /** `overlay` floats under the nav so mount/unmount does not shift page content. */
  placement?: 'flow' | 'overlay'
}

export default function StatusBanner({
  children,
  tone = 'neutral',
  role = 'status',
  placement = 'flow',
}: Props) {
  const toneClass =
    tone === 'error'
      ? ' status-banner--error'
      : tone === 'success'
        ? ' status-banner--success'
        : ''
  const placementClass = placement === 'overlay' ? ' status-banner--overlay' : ''

  return (
    <p className={`status-banner${toneClass}${placementClass}`} role={role}>
      {children}
    </p>
  )
}
