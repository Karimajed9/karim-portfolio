import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  tone?: 'neutral' | 'error' | 'success'
  role?: 'status' | 'alert'
}

export default function StatusBanner({
  children,
  tone = 'neutral',
  role = 'status',
}: Props) {
  const toneClass =
    tone === 'error'
      ? ' status-banner--error'
      : tone === 'success'
        ? ' status-banner--success'
        : ''

  return (
    <p className={`status-banner${toneClass}`} role={role}>
      {children}
    </p>
  )
}
