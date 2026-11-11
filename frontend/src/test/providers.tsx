import type { ReactNode } from 'react'
import { LocaleProvider } from '../i18n/LocaleContext'
import { ThemeProvider } from '../theme/ThemeContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>{children}</LocaleProvider>
    </ThemeProvider>
  )
}
