import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('case breadcrumb', () => {
  it('stays sticky under the site header', () => {
    const css = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'index.css'), 'utf8')
    const rule = css.match(/\.case-breadcrumb\s*\{[^}]+\}/)?.[0] ?? ''
    expect(rule).toMatch(/position:\s*sticky/)
    expect(rule).toMatch(/top:\s*var\(--nav-h\)/)
    expect(rule).toMatch(/z-index:\s*40/)
  })
})
