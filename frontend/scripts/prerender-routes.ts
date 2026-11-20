import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const SITE_ORIGIN = 'https://karimmajed.com'

export const HOME_TITLE = 'Karim Majed | Backend Software Developer | .NET & Azure'

export const HOME_DESCRIPTION =
  "Explore Karim Majed's software development portfolio, featuring backend engineering, C#, .NET, Java, Azure integrations, SQL Server, and personal projects."

export type PrerenderRoute = {
  /** URL path. Only these files are written. */
  path: '/' | '/contact' | '/projects/personal-portfolio-platform' | '/admin'
  file: string
  title: string
  description: string
  index: boolean
}

/** The only HTML documents emitted besides the Vite bundle. Unknown paths are not files. */
export const PRERENDER_ROUTES: readonly PrerenderRoute[] = [
  {
    path: '/',
    file: 'index.html',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    index: true,
  },
  {
    path: '/contact',
    file: 'contact/index.html',
    title: 'Contact | Karim Majed',
    description: 'Happy to talk about roles or projects. Email me or use the form below.',
    index: true,
  },
  {
    path: '/projects/personal-portfolio-platform',
    file: 'projects/personal-portfolio-platform/index.html',
    title: 'Personal Portfolio Platform | Karim Majed',
    description:
      'Full-stack portfolio SPA on Azure Static Web Apps with a Spring Boot API and PostgreSQL on Render, plus admin editing and static-first fallbacks.',
    index: true,
  },
  {
    path: '/admin',
    file: 'admin/index.html',
    title: 'Admin | Karim Majed',
    description: 'Sign in to edit content and view contact messages.',
    index: false,
  },
]

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function replaceOne(html: string, pattern: RegExp, replacement: string, label: string): string {
  const matches = html.match(pattern)
  if (!matches || matches.length !== 1) {
    throw new Error(`Expected one ${label} tag, found ${matches?.length ?? 0}`)
  }
  return html.replace(pattern, replacement)
}

function replaceMeta(html: string, attr: 'name' | 'property', key: string, content: string): string {
  return replaceOne(
    html,
    new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*\\/?>`, 'g'),
    `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`,
    `${attr}=${key}`,
  )
}

export function canonicalUrl(path: PrerenderRoute['path']): string {
  return path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`
}

/** Copy the built shell and set the tags a crawler sees without running the app. */
export function renderRouteHtml(template: string, route: PrerenderRoute): string {
  let html = replaceOne(template, /<title>[\s\S]*?<\/title>/g, `<title>${escapeHtml(route.title)}</title>`, 'title')
  html = replaceMeta(html, 'name', 'description', route.description)
  html = replaceMeta(html, 'name', 'robots', route.index ? 'index, follow' : 'noindex, follow')
  html = replaceMeta(html, 'property', 'og:title', route.title)
  html = replaceMeta(html, 'property', 'og:description', route.description)
  html = replaceMeta(html, 'property', 'og:url', canonicalUrl(route.path))
  html = replaceMeta(html, 'name', 'twitter:title', route.title)
  html = replaceMeta(html, 'name', 'twitter:description', route.description)

  if (route.index) {
    html = replaceOne(
      html,
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/g,
      `<link rel="canonical" href="${canonicalUrl(route.path)}" />`,
      'canonical',
    )
  } else {
    html = replaceOne(html, /\s*<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/g, '', 'canonical')
  }

  const canonicals = html.match(/rel="canonical"/g)
  if (route.index) {
    if (canonicals?.length !== 1) throw new Error(`Expected one canonical for ${route.path}`)
  } else if (canonicals) {
    throw new Error(`Admin HTML still has a canonical`)
  }

  // createRoot replaces #root, so this text is only for crawlers that do not run JS.
  const preview = `<div id="root"><h1>${escapeHtml(route.title)}</h1><p>${escapeHtml(route.description)}</p></div>`
  html = replaceOne(html, /<div id="root">\s*<\/div>/g, preview, 'root')
  return html
}

export function prerenderIndexableRoutes(distDir: string): void {
  const template = readFileSync(join(distDir, 'index.html'), 'utf8')
  for (const route of PRERENDER_ROUTES) {
    const target = join(distDir, route.file)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, renderRouteHtml(template, route))
  }
}
