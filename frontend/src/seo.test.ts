import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { applyDocumentSeo, HOME_DESCRIPTION, HOME_TITLE } from './lib/siteSeo'
import { canonicalUrl, PRERENDER_ROUTES, renderRouteHtml } from '../scripts/prerender-routes.ts'

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function read(relative: string) {
  return readFileSync(resolve(frontendRoot, relative), 'utf8')
}

describe('indexable SEO files', () => {
  it('puts the homepage title, description, and one set of social tags in index.html', () => {
    const html = read('index.html')
    expect(html.match(/<title>/g)).toHaveLength(1)
    expect(html).toContain(`<title>${HOME_TITLE.replace('&', '&amp;')}</title>`)
    expect(html.match(/name="description"/g)).toHaveLength(1)
    expect(html).toContain(HOME_DESCRIPTION)
    expect(html.match(/rel="canonical"/g)).toHaveLength(1)
    expect(html).toContain('href="https://karimmajed.com/"')
    expect(html).not.toContain('azurestaticapps.net')
    expect(html).not.toContain('github.io')
    expect(html.match(/property="og:title"/g)).toHaveLength(1)
    expect(html.match(/property="og:image"/g)).toHaveLength(1)
    expect(html).toContain('https://karimmajed.com/og/karim-majed.png')
    expect(html).toContain('property="og:image:width" content="1200"')
    expect(html).toContain('property="og:image:height" content="630"')
    expect(html.match(/property="og:image"/g)).toHaveLength(1)
    expect(html.match(/name="twitter:image"/g)).toHaveLength(1)
    expect(html.match(/name="twitter:card"/g)).toHaveLength(1)
    expect(html.match(/application\/ld\+json/g)).toHaveLength(1)
    expect(html).toContain('https://github.com/Karimajed9')
    expect(html).toContain('https://www.linkedin.com/in/karimajed9')
    expect(html).not.toContain('twitter.com')
  })

  it('lists only real public routes and does not invent lastmod', () => {
    const sitemap = read('public/sitemap.xml')
    expect(sitemap).toContain('<loc>https://karimmajed.com/</loc>')
    expect(sitemap).toContain('<loc>https://karimmajed.com/contact</loc>')
    expect(sitemap).toContain(
      '<loc>https://karimmajed.com/projects/personal-portfolio-platform</loc>',
    )
    expect(sitemap).not.toContain('/admin')
    expect(sitemap).not.toContain('/api')
    expect(sitemap).not.toContain('<lastmod>')
    expect(sitemap.match(/<loc>/g)).toHaveLength(3)
  })

  it('allows crawling and does not hide admin only in robots.txt', () => {
    const robots = read('public/robots.txt')
    expect(robots).toContain('Allow: /')
    expect(robots).toContain('Sitemap: https://karimmajed.com/sitemap.xml')
    expect(robots.toLowerCase()).not.toContain('disallow')

    const config = JSON.parse(read('public/staticwebapp.config.json')) as {
      globalHeaders?: Record<string, string>
      routes?: { route?: string; rewrite?: string; headers?: Record<string, string> }[]
    }
    expect(config.globalHeaders?.['Content-Security-Policy']).toBe("frame-ancestors 'self'")
    expect(config.globalHeaders?.['X-Robots-Tag']).toBeUndefined()
    expect(config).not.toHaveProperty('navigationFallback')
    const overrides = (config as { responseOverrides?: { 404?: { rewrite?: string; statusCode?: number } } })
      .responseOverrides
    expect(overrides?.['404']?.rewrite).toBe('/404.html')
    expect(overrides?.['404']?.statusCode).toBe(404)
    const notFound = read('public/404.html')
    expect(notFound).toContain('noindex, follow')
    expect(notFound).not.toContain('rel="canonical"')
    const admin = config.routes?.find((route) => route.route === '/admin')
    expect(admin?.rewrite).toBe('/admin/index.html')
    expect(admin?.headers?.['X-Robots-Tag']).toBe('noindex')
    expect(admin?.headers?.['Content-Security-Policy']).toBeUndefined()
    const shellRoutes = new Set(['/about', '/about/', '/skills', '/skills/', '/experience', '/experience/', '/projects', '/projects/'])
    for (const route of config.routes ?? []) {
      expect(route.route?.includes('*')).toBe(false)
      if (route.route === '/admin' || route.route === '/admin/') {
        expect(route.headers?.['X-Robots-Tag']).toBe('noindex')
        expect(route.rewrite).toBe('/admin/index.html')
      } else {
        expect(route.headers?.['X-Robots-Tag']).toBeUndefined()
      }
      if (shellRoutes.has(route.route ?? '')) {
        expect(route.rewrite).toBe('/index.html')
      } else if (route.route !== '/admin' && route.route !== '/admin/') {
        expect(route.rewrite).not.toBe('/index.html')
      }
    }
  })

  it('writes a distinct canonical for each indexable route and none for admin', () => {
    const template = read('index.html')
    const pages = PRERENDER_ROUTES.map((route) => renderRouteHtml(template, route))
    const indexable = PRERENDER_ROUTES.filter((route) => route.index)
    expect(indexable.map((route) => route.path)).toEqual([
      '/',
      '/contact',
      '/projects/personal-portfolio-platform',
    ])
    for (const route of indexable) {
      const html = renderRouteHtml(template, route)
      expect(html.match(/rel="canonical"/g)).toHaveLength(1)
      expect(html).toContain(`href="${canonicalUrl(route.path)}"`)
      expect(html).toContain(`content="${canonicalUrl(route.path)}"`)
      expect(html.match(/<title>/g)).toHaveLength(1)
      expect(html.match(/name="description"/g)).toHaveLength(1)
      expect(html.match(/property="og:title"/g)).toHaveLength(1)
      expect(html.match(/property="og:url"/g)).toHaveLength(1)
      expect(html).toContain(`<h1>${route.title.replaceAll('&', '&amp;')}</h1>`)
      expect(html).toContain('https://karimmajed.com/og/karim-majed.png')
    }
    const admin = pages[pages.length - 1] ?? ''
    expect(admin).toContain('noindex, follow')
    expect(admin).not.toContain('rel="canonical"')
    expect(new Set(indexable.map((route) => canonicalUrl(route.path))).size).toBe(3)
  })

  it('does not duplicate canonical or robots tags when a route changes', () => {
    document.head.innerHTML = `
      <title>old</title>
      <meta name="description" content="old" />
      <link rel="canonical" href="https://karimmajed.com/" />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content="old" />
      <meta property="og:description" content="old" />
      <meta property="og:url" content="https://karimmajed.com/" />
      <meta name="twitter:title" content="old" />
      <meta name="twitter:description" content="old" />
    `
    applyDocumentSeo({
      title: 'Contact | Karim Majed',
      description: 'Happy to talk about roles or projects. Email me or use the form below.',
      path: '/contact',
      index: true,
    })
    applyDocumentSeo({
      title: 'Page not found | Karim Majed',
      description: 'This page does not exist.',
      path: '/missing',
      index: false,
    })
    expect(document.title).toBe('Page not found | Karim Majed')
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(0)
    expect(document.head.querySelectorAll('meta[name="robots"]')).toHaveLength(1)
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, follow',
    )
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(document.head.querySelectorAll('meta[property="og:title"]')).toHaveLength(1)
  })
})
