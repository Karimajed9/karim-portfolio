import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiUrl, SLOW_FETCH_MS, writeApiCache } from '../api'
import { siteEn } from '../i18n/en'
import { AppProviders } from '../test/providers'
import HomePage from './HomePage'

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    status: ok ? 200 : 503,
    json: async () => body,
  }
}

function emptyAbout() {
  return {
    summary: 'unused',
    goals: 'unused',
    professionalInterests: '',
    personalInterests: '',
    education: [] as unknown[],
  }
}

function mockContentApis(handlers: {
  experience?: () => Promise<unknown> | unknown
  projects?: () => Promise<unknown> | unknown
  skills?: () => Promise<unknown> | unknown
  about?: () => Promise<unknown> | unknown
  health?: () => Promise<unknown> | unknown
}) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('/api/health')) {
      const value = handlers.health ? await handlers.health() : { status: 'ok' }
      return jsonResponse(value)
    }
    if (url.includes('/api/experience')) {
      const value = handlers.experience ? await handlers.experience() : []
      return typeof value === 'object' && value !== null && 'ok' in (value as object)
        ? value
        : jsonResponse(value)
    }
    if (url.includes('/api/projects')) {
      const value = handlers.projects ? await handlers.projects() : []
      return typeof value === 'object' && value !== null && 'ok' in (value as object)
        ? value
        : jsonResponse(value)
    }
    if (url.includes('/api/skills')) {
      const value = handlers.skills ? await handlers.skills() : []
      return typeof value === 'object' && value !== null && 'ok' in (value as object)
        ? value
        : jsonResponse(value)
    }
    if (url.includes('/api/about')) {
      const value = handlers.about ? await handlers.about() : emptyAbout()
      return typeof value === 'object' && value !== null && 'ok' in (value as object)
        ? value
        : jsonResponse(value)
    }
    return jsonResponse(null, false)
  })
}

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('renders the portfolio name as the hero heading', async () => {
    vi.stubGlobal(
      'fetch',
      mockContentApis({
        experience: () => [
          {
            id: 1,
            company: 'API Co',
            role: 'API Role',
            startDate: '2024',
            endDate: 'Present',
            location: 'Montréal',
            highlights: 'Live highlight',
          },
        ],
        projects: () => [
          {
            id: 1,
            name: 'API Project',
            summary: 'From API',
            tags: 'React,TypeScript',
            href: 'https://example.com',
          },
        ],
        skills: () => [
          { id: 1, category: 'API Skills', name: 'LiveSkill', sortOrder: 1 },
        ],
        about: () => ({
          ...emptyAbout(),
          education: [
            {
              id: 1,
              school: 'API University',
              city: 'Montréal',
              degree: 'API Degree',
              country: 'Canada',
              startDate: 'September 2020',
              endDate: 'August 2021',
            },
          ],
        }),
      }),
    )

    render(
      <AppProviders>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </AppProviders>,
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Karim\s*Majed/)
    expect(screen.getByRole('link', { name: /Get in touch/i })).toHaveAttribute('href', '#contact')
    expect(screen.getByRole('heading', { name: /Core technical skills/i })).toBeInTheDocument()
    // Bundled static paints immediately before the network resolves.
    expect(screen.getByText(siteEn.experience[0]!.company)).toBeInTheDocument()
    // Profile copy stays bundled even after /api/about resolves.
    expect(screen.getByText(siteEn.about.summary)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('API Co')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'API Project' })).toBeInTheDocument()
      expect(screen.getByText('LiveSkill')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'API Degree' })).toBeInTheDocument()
    })
    expect(screen.getByText(siteEn.about.summary)).toBeInTheDocument()
  })

  it('swaps in live experience, projects, skills, and education on success without dropping static first paint', async () => {
    const fetchMock = mockContentApis({
      experience: () => [
        {
          id: 9,
          company: 'Live Experience Co',
          role: 'Live Role',
          startDate: 'January 2025',
          endDate: 'Present',
          location: 'Montréal, Canada',
          highlights: 'First live|||Second live',
        },
      ],
      projects: () => [
        {
          id: 3,
          name: 'Live Portfolio',
          summary: 'Fetched project',
          tags: 'Java,Spring Boot',
          href: 'https://github.com/example/live',
        },
      ],
      skills: () => [
        { id: 1, category: 'Cloud', name: 'Azure Functions', sortOrder: 1 },
        { id: 2, category: 'Cloud', name: 'Logic Apps', sortOrder: 2 },
      ],
      about: () => ({
        ...emptyAbout(),
        summary: 'Should not replace profile copy',
        education: [
          {
            id: 9,
            school: 'Live University',
            city: 'Montréal',
            degree: 'Live Degree',
            country: 'Canada',
            startDate: 'September 2020',
            endDate: 'August 2021',
          },
        ],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <AppProviders>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </AppProviders>,
    )

    expect(screen.getByText(siteEn.experience[0]!.company)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: siteEn.projects.items[0]!.name })).toBeInTheDocument()
    expect(screen.getByText(siteEn.skills[0]!.items[0]!)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: siteEn.about.education[0]!.degree })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Live Experience Co')).toBeInTheDocument()
      expect(screen.getByText('First live')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Live Portfolio' })).toBeInTheDocument()
      expect(screen.getByText('Azure Functions')).toBeInTheDocument()
      expect(screen.getByText('Logic Apps')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Live Degree' })).toBeInTheDocument()
      expect(screen.getByText(/Live University/)).toBeInTheDocument()
    })

    expect(screen.getByText(siteEn.about.summary)).toBeInTheDocument()
    expect(screen.queryByText('Should not replace profile copy')).not.toBeInTheDocument()

    const experienceCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).includes('/api/experience'),
    )
    const projectCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).includes('/api/projects'),
    )
    const skillCalls = fetchMock.mock.calls.filter(([input]) => String(input).includes('/api/skills'))
    const aboutCalls = fetchMock.mock.calls.filter(([input]) => String(input).includes('/api/about'))
    expect(experienceCalls).toHaveLength(1)
    expect(projectCalls).toHaveLength(1)
    expect(skillCalls).toHaveLength(1)
    expect(aboutCalls).toHaveLength(1)
    expect(String(experienceCalls[0]![0])).toBe(apiUrl('/api/experience'))
    expect(String(projectCalls[0]![0])).toBe(apiUrl('/api/projects'))
    expect(String(skillCalls[0]![0])).toBe(apiUrl('/api/skills'))
    expect(String(aboutCalls[0]![0])).toBe(apiUrl('/api/about'))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('keeps bundled fallback and shows offline banner when content requests fail', async () => {
    const fetchMock = mockContentApis({
      experience: () => jsonResponse(null, false),
      projects: () => jsonResponse(null, false),
      skills: () => jsonResponse(null, false),
      about: () => jsonResponse(null, false),
      health: () => Promise.reject(new TypeError('Failed to fetch')),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <AppProviders>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </AppProviders>,
    )

    expect(screen.getByText(siteEn.experience[0]!.company)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/can't reach the api/i)
    })
    expect(screen.getByText(siteEn.experience[0]!.company)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: siteEn.projects.items[0]!.name })).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes('/api/health'))).toBe(
      true,
    )
  })

  it('shows offline banner and probes health when cached content revalidate fails', async () => {
    writeApiCache('/api/experience', [
      {
        id: 1,
        company: 'Cached Co',
        role: 'Cached Role',
        startDate: '2020',
        endDate: '2021',
        location: 'Montréal',
        highlights: 'Cached highlight',
      },
    ])
    writeApiCache('/api/projects', [
      {
        id: 1,
        name: 'Cached Project',
        summary: 'Cached',
        tags: 'React',
        href: 'https://example.com/cached',
      },
    ])

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/api/health')) {
        return Promise.reject(new TypeError('Failed to fetch'))
      }
      return Promise.reject(new TypeError('Failed to fetch'))
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <AppProviders>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </AppProviders>,
    )

    expect(screen.getByText('Cached Co')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/can't reach the api/i)
    })
    expect(screen.getByText('Cached Co')).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes('/api/health'))).toBe(
      true,
    )
  })

  it('treats empty 200 arrays as success and clears the fallback banner', async () => {
    writeApiCache('/api/experience', [
      {
        id: 1,
        company: 'Cached Co',
        role: 'Cached Role',
        startDate: '2020',
        endDate: '2021',
        location: 'Montréal',
        highlights: 'Cached highlight',
      },
    ])
    writeApiCache('/api/projects', [
      {
        id: 1,
        name: 'Cached Project',
        summary: 'Cached',
        tags: 'React',
        href: 'https://example.com/cached',
      },
    ])
    writeApiCache('/api/skills', [
      { id: 1, category: 'Cached', name: 'CachedSkill', sortOrder: 1 },
    ])
    writeApiCache('/api/about', {
      ...emptyAbout(),
      education: [
        {
          id: 1,
          school: 'Cached U',
          city: 'Montréal',
          degree: 'Cached Degree',
          country: 'Canada',
          startDate: '2020',
          endDate: '2021',
        },
      ],
    })

    vi.stubGlobal(
      'fetch',
      mockContentApis({
        experience: () => [],
        projects: () => [],
        skills: () => [],
        about: () => emptyAbout(),
      }),
    )

    render(
      <AppProviders>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </AppProviders>,
    )

    expect(screen.getByText('Cached Co')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText('Cached Co')).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Cached Project' })).not.toBeInTheDocument()
      expect(screen.queryByText('CachedSkill')).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Cached Degree' })).not.toBeInTheDocument()
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('keeps static content visible during a delayed response then swaps to live', async () => {
    vi.useFakeTimers()

    let resolveExperience!: (value: unknown) => void
    let resolveProjects!: (value: unknown) => void
    let resolveSkills!: (value: unknown) => void
    let resolveAbout!: (value: unknown) => void

    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        if (url.includes('/api/health')) {
          return new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
              const err = new Error('Aborted')
              err.name = 'AbortError'
              reject(err)
            })
          })
        }
        if (url.includes('/api/experience')) {
          return new Promise((resolve) => {
            resolveExperience = resolve
          })
        }
        if (url.includes('/api/projects')) {
          return new Promise((resolve) => {
            resolveProjects = resolve
          })
        }
        if (url.includes('/api/skills')) {
          return new Promise((resolve) => {
            resolveSkills = resolve
          })
        }
        if (url.includes('/api/about')) {
          return new Promise((resolve) => {
            resolveAbout = resolve
          })
        }
        return Promise.resolve(jsonResponse(null, false))
      }),
    )

    render(
      <AppProviders>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </AppProviders>,
    )

    expect(screen.getByText(siteEn.experience[0]!.company)).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SLOW_FETCH_MS)
    })

    expect(screen.getByRole('status')).toHaveTextContent(/starting up/i)
    expect(screen.getByText(siteEn.experience[0]!.company)).toBeInTheDocument()

    await act(async () => {
      resolveExperience(
        jsonResponse([
          {
            id: 2,
            company: 'Delayed Co',
            role: 'Delayed Role',
            startDate: '2024',
            endDate: 'Present',
            location: 'Montréal',
            highlights: 'Arrived later',
          },
        ]),
      )
      resolveProjects(
        jsonResponse([
          {
            id: 2,
            name: 'Delayed Project',
            summary: 'Slow payload',
            tags: 'TypeScript',
            href: 'https://example.com/delayed',
          },
        ]),
      )
      resolveSkills(
        jsonResponse([{ id: 2, category: 'Delayed', name: 'DelayedSkill', sortOrder: 1 }]),
      )
      resolveAbout(
        jsonResponse({
          ...emptyAbout(),
          education: [
            {
              id: 2,
              school: 'Delayed U',
              city: 'Montréal',
              degree: 'Delayed Degree',
              country: 'Canada',
              startDate: '2020',
              endDate: '2021',
            },
          ],
        }),
      )
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByText('Delayed Co')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Delayed Project' })).toBeInTheDocument()
    expect(screen.getByText('DelayedSkill')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Delayed Degree' })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
