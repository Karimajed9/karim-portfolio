import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = path.dirname(fileURLToPath(import.meta.url))
const scenarios = path.resolve(here, '../../backend/.mvn/wrapper/fetch-dist-scenarios.sh')

function bashBin() {
  const programFiles = process.env.ProgramFiles
  const gitBash = programFiles ? path.join(programFiles, 'Git', 'bin', 'bash.exe') : ''
  if (gitBash && existsSync(gitBash)) return gitBash
  return 'bash'
}

describe('maven wrapper download', () => {
  it('falls back to curl when wget cannot fetch Maven', () => {
    const output = execFileSync(bashBin(), [scenarios], { encoding: 'utf8' })

    expect(output).toContain('wget-fails-curl-fetches')
    expect(output).toContain('wget-fetches-without-curl')
    expect(output).toContain('both-fail')
    expect(output).toContain('mvnw-uses-fallback')
  })
})
