import { useEffect } from 'react'

/** Apex host. www and the Azure/GitHub Pages hosts are not canonical. */
export const SITE_ORIGIN = 'https://karimmajed.com'

export const HOME_TITLE = 'Karim Majed | Backend Software Developer | .NET & Azure'

export const HOME_DESCRIPTION =
  "Explore Karim Majed's software development portfolio, featuring backend engineering, C#, .NET, Java, Azure integrations, SQL Server, and personal projects."

/** Sized social card in public/og. The case-study cover stays a separate asset. */
export const OG_IMAGE_PATH = '/og/karim-majed.png'

export type DocumentSeo = {
  title: string
  description: string
  path: string
  index: boolean
}

export function canonicalUrl(path: string): string {
  if (path === '/' || path === '') return `${SITE_ORIGIN}/`
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_ORIGIN}${normalized}`
}

function setMeta(attr: 'name' | 'property', key: string, content: string, create: boolean) {
  const nodes = [...document.head.querySelectorAll(`meta[${attr}="${key}"]`)]
  if (nodes.length === 0 && !create) return
  const el = nodes[0] ?? document.createElement('meta')
  el.setAttribute(attr, key)
  el.setAttribute('content', content)
  if (!el.parentNode) document.head.appendChild(el)
  for (const extra of nodes.slice(1)) extra.remove()
}

function setCanonical(href: string | null) {
  const nodes = [...document.head.querySelectorAll('link[rel="canonical"]')]
  if (!href) {
    for (const node of nodes) node.remove()
    return
  }
  const link = nodes[0] ?? document.createElement('link')
  link.setAttribute('rel', 'canonical')
  link.setAttribute('href', href)
  if (!link.parentNode) document.head.appendChild(link)
  for (const extra of nodes.slice(1)) extra.remove()
}

/** Update the tags that index.html already ships. Does not add a second JSON-LD block. */
export function applyDocumentSeo({ title, description, path, index }: DocumentSeo) {
  document.title = title
  setMeta('name', 'description', description, true)
  setMeta('name', 'robots', index ? 'index, follow' : 'noindex, follow', true)
  const url = canonicalUrl(path)
  setCanonical(index ? url : null)
  setMeta('property', 'og:title', title, false)
  setMeta('property', 'og:description', description, false)
  setMeta('property', 'og:url', url, false)
  setMeta('name', 'twitter:title', title, false)
  setMeta('name', 'twitter:description', description, false)
}

export function useDocumentSeo(seo: DocumentSeo) {
  const { title, description, path, index } = seo
  useEffect(() => {
    applyDocumentSeo({ title, description, path, index })
  }, [title, description, path, index])
}
