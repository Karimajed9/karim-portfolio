import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(frontendRoot, '..')

type StaticHostConfig = {
  globalHeaders?: Record<string, string>
  navigationFallback?: { rewrite?: string; exclude?: string[] }
  routes?: { route?: string; rewrite?: string; headers?: Record<string, string> }[]
}

function frameAncestorSources(csp: string): string[] {
  const match = csp.match(/frame-ancestors\s+([^;]+)/i)
  expect(match, csp).toBeTruthy()
  return match![1].trim().split(/\s+/)
}

describe('SPA frame ancestors', () => {
  it('ships frame-ancestors self on the Azure artifact for / and /admin', () => {
    const config = JSON.parse(
      readFileSync(resolve(frontendRoot, 'public/staticwebapp.config.json'), 'utf8'),
    ) as StaticHostConfig
    const csp = config.globalHeaders?.['Content-Security-Policy'] ?? ''
    const sources = frameAncestorSources(csp)
    const exclude = config.navigationFallback?.exclude ?? []

    expect(sources).toEqual(["'self'"])
    expect(sources).not.toContain('*')
    expect(sources).not.toContain('https://evil.example')
    expect(config.globalHeaders?.['X-Robots-Tag']).toBeUndefined()
    expect(config.navigationFallback).toBeUndefined()
    expect(exclude).toEqual([])
    const admin = config.routes?.find((route) => route.route === '/admin')
    expect(admin?.rewrite).toBe('/admin/index.html')
    expect(admin?.headers?.['X-Robots-Tag']).toBe('noindex')
    for (const route of config.routes ?? []) {
      expect(route.headers?.['Content-Security-Policy']).toBeUndefined()
      expect(route.route).not.toBe('*')
      expect(route.route?.includes('*')).toBe(false)
    }

    const viteConfig = readFileSync(resolve(frontendRoot, 'vite.config.ts'), 'utf8')
    expect(viteConfig).not.toMatch(/publicDir\s*:\s*false/)
    expect(viteConfig).not.toMatch(/outDir\s*:/)

    const workflow = readFileSync(
      resolve(repoRoot, '.github/workflows/azure-static-web-apps.yml'),
      'utf8',
    )
    expect(workflow).toContain('# Azure/static-web-apps-deploy v1')
    expect(workflow).toContain(
      'uses: Azure/static-web-apps-deploy@1a947af9992250f3bc2e68ad0754c0b0c11566c9',
    )
    expect(workflow).toContain('app_location: frontend')
    expect(workflow).toContain('output_location: dist')
    expect(workflow).not.toMatch(/skip_app_build:\s*true/)

    const nginx = readFileSync(resolve(frontendRoot, 'nginx.conf'), 'utf8')
    const spa = nginx.slice(nginx.indexOf('location / {'))
    expect(spa).toContain('try_files $uri $uri/ /index.html')
    expect(spa).toContain('add_header Content-Security-Policy "frame-ancestors \'self\'" always;')
    const apiBlock = nginx.slice(nginx.indexOf('location /api/'), nginx.indexOf('location /cv/'))
    expect(apiBlock).not.toContain('frame-ancestors')
  })
})
