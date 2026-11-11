import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { siteEn, uiEn } from './en'
import { siteFr, uiFr } from './fr'
import type { Locale, SiteContent, UiCopy } from './types'

const STORAGE_KEY = 'portfolio-lang'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  site: SiteContent
  ui: UiCopy
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function readStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'fr' || raw === 'en') return raw
  } catch {
    // private mode
  }
  return 'en'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale())

  function setLocale(next: Locale) {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<LocaleContextValue>(() => {
    const site = locale === 'fr' ? siteFr : siteEn
    const ui = locale === 'fr' ? uiFr : uiEn
    return { locale, setLocale, site, ui }
  }, [locale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return ctx
}
