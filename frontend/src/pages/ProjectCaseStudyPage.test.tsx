import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PORTFOLIO_SLUG } from '../lib/portfolioCaseStudy'
import { publicAssetUrl } from '../lib/publicAsset'
import { siteEn } from '../i18n/en'
import { resetApiBannerState } from '../lib/apiBannerState'
import { AppProviders } from '../test/providers'
import ProjectCaseStudyPage from './ProjectCaseStudyPage'

function renderCase(slug: string) {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[`/projects/${slug}`]}>
        <Routes>
          <Route path="/projects/:slug" element={<ProjectCaseStudyPage />} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  )
}

describe('ProjectCaseStudyPage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    resetApiBannerState()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    resetApiBannerState()
  })

  it('renders the portfolio case study from static fallback when the API fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.resolve({ ok: false, status: 503, json: async () => ({}) })),
    )

    renderCase(PORTFOLIO_SLUG)

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: siteEn.projects.items[0]!.name,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(siteEn.projects.items[0]!.overview)).toBeInTheDocument()
    expect(screen.getAllByText(/Azure Static Web Apps/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Render/i).length).toBeGreaterThan(0)
    const cover = document.querySelector('.case-hero-image')
    expect(cover).toHaveAttribute(
      'src',
      publicAssetUrl(siteEn.projects.items[0]!.coverImageUrl),
    )
    const overviewLink = document.querySelector('.case-nav a[href="#overview"]')
    expect(overviewLink?.classList.contains('is-active')).toBe(true)
    const githubLinks = screen.getAllByRole('link', { name: /GitHub/i })
    expect(githubLinks.length).toBeGreaterThan(0)
    expect(githubLinks[0]).toHaveAttribute('href', siteEn.projects.items[0]!.href)
  })

  it('swaps in live API case-study fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/projects')) {
          return {
            ok: true,
            status: 200,
            json: async () => [
              {
                id: 7,
                slug: PORTFOLIO_SLUG,
                nameEn: 'Live Portfolio Case',
                nameFr: '',
                summaryEn: 'Live summary',
                summaryFr: '',
                tagsEn: 'React,Spring Boot',
                tagsFr: '',
                href: 'https://github.com/Karimajed9/karim-portfolio',
                categoryEn: 'Personal project',
                statusEn: 'In progress',
                overviewEn: 'Live overview from API',
                problemEn: 'Live problem statement',
                featuresEn: 'Feature one|||Feature two',
                testingEn: 'Vitest and Testcontainers',
                mark: 'KM',
                sortOrder: 1,
              },
            ],
          }
        }
        return { ok: false, status: 404, json: async () => ({}) }
      }),
    )

    renderCase(PORTFOLIO_SLUG)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Live Portfolio Case' })).toBeInTheDocument()
      expect(screen.getByText('Live overview from API')).toBeInTheDocument()
      expect(screen.getByText('Feature one')).toBeInTheDocument()
    })
  })

  it('keeps the cover image ahead of markdown in the overview', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/projects')) {
          return {
            ok: true,
            status: 200,
            json: async () => [
              {
                id: 7,
                slug: 'markdown-cover',
                nameEn: 'Markdown Cover',
                nameFr: '',
                summaryEn: 'Summary',
                summaryFr: '',
                tagsEn: '',
                tagsFr: '',
                href: '',
                coverImageUrl: 'https://cdn.example.com/cover.png',
                overviewEn: 'Intro ![shot](https://cdn.example.com/from-markdown.png) more',
                overviewFr: '',
                mark: 'MC',
                sortOrder: 1,
              },
            ],
          }
        }
        return { ok: false, status: 404, json: async () => ({}) }
      }),
    )

    renderCase('markdown-cover')

    const cover = await waitFor(() => {
      const image = document.querySelector('.case-hero-image')
      expect(image).toHaveAttribute('src', 'https://cdn.example.com/cover.png')
      return image as HTMLImageElement
    })
    const overview = screen.getByText(/Intro/)
    expect(cover.compareDocumentPosition(overview) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(document.querySelectorAll('.case-hero-image')).toHaveLength(1)
  })

  it('shows not-found copy for an unknown slug', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: async () => [],
        }),
      ),
    )

    renderCase('missing-project')

    expect(await screen.findByText(/case study was not found/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to projects/i })).toHaveAttribute(
      'href',
      '/#projects',
    )
  })

  it('builds each project stack diagram from its tags', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.resolve({ ok: false, status: 503, json: async () => ({}) })),
    )

    const flowforge = renderCase('flowforge')

    expect(await screen.findByRole('heading', { level: 1, name: 'FlowForge' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Architecture/i })).toBeInTheDocument()
    expect(stackKickers()).toEqual(['Frontend', 'API', 'Data', 'Tooling'])
    expect(stackBoxTitles()).toEqual([
      'React / TypeScript',
      'Spring Boot',
      'PostgreSQL',
      'Docker',
    ])
    expect(stackDetails()).toEqual(['Tailwind CSS', 'Java · REST API', 'Testcontainers'])
    expect(stackArrows()).toEqual(['↓', '↓'])
    expect(document.querySelector('.case-arch-node--optional .case-arch-kicker')?.textContent).toBe(
      'Tooling',
    )
    expect(document.querySelector('.case-arch-board')?.textContent).not.toContain('RabbitMQ')
    expect(screen.getByText(/queued through RabbitMQ/i)).toBeInTheDocument()
    expect(screen.getByText(/Webhooks are received by Spring Boot/i)).toBeInTheDocument()
    expect(screen.queryByText('Azure Static Web Apps')).not.toBeInTheDocument()
    flowforge.unmount()

    renderCase('eva')

    expect(await screen.findByRole('heading', { level: 1, name: /EVA/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Architecture/i })).toBeInTheDocument()
    expect(stackKickers()).toEqual(['Frontend', 'API', 'Tooling'])
    expect(stackBoxTitles()).toEqual(['React / TypeScript / Vite', 'Spring Boot', 'Maven'])
    expect(stackDetails()).toEqual(['Tailwind CSS · Electron', 'Java', 'GitHub Actions'])
    expect(stackArrows()).toEqual(['↓'])
    expect(document.querySelector('.case-arch-node--optional .case-arch-kicker')?.textContent).toBe(
      'Tooling',
    )
    expect(screen.queryByText('Azure Static Web Apps')).not.toBeInTheDocument()
    expect(screen.queryByText('Data')).not.toBeInTheDocument()
  })

  it('keeps the project breadcrumb sticky and points PROJECTS at the projects section', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.resolve({ ok: false, status: 503, json: async () => ({}) })),
    )

    renderCase('flowforge')

    const crumb = await screen.findByRole('navigation', { name: 'Breadcrumb' })
    expect(crumb).toHaveClass('case-breadcrumb')
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/#projects')
  })

  it('shows an architecture image instead of generated boxes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/projects')) {
          return {
            ok: true,
            status: 200,
            json: async () => [
              {
                id: 9,
                slug: 'diagram-image',
                nameEn: 'Diagram Image',
                nameFr: '',
                summaryEn: 'Summary',
                summaryFr: '',
                tagsEn: 'React,PostgreSQL',
                tagsFr: '',
                architectureImageUrl: 'https://cdn.example.com/architecture.png',
                architectureCaptionEn: 'Stored caption',
                architectureCaptionFr: '',
                sortOrder: 1,
              },
            ],
          }
        }
        return { ok: false, status: 404, json: async () => ({}) }
      }),
    )

    renderCase('diagram-image')

    expect(await screen.findByRole('heading', { level: 1, name: 'Diagram Image' })).toBeInTheDocument()
    expect(document.querySelector('.case-gallery-item img')).toHaveAttribute(
      'src',
      'https://cdn.example.com/architecture.png',
    )
    expect(stackBoxTitles()).toEqual([])
    expect(screen.getByText('Stored caption')).toBeInTheDocument()
  })
})

function stackKickers(): string[] {
  return [...document.querySelectorAll('.case-arch-kicker')].map((node) => node.textContent ?? '')
}

function stackBoxTitles(): string[] {
  return [...document.querySelectorAll('.case-arch-node strong')].map((node) => node.textContent ?? '')
}

function stackDetails(): string[] {
  return [...document.querySelectorAll('.case-arch-node span:not(.case-arch-kicker)')].map(
    (node) => node.textContent ?? '',
  )
}

function stackArrows(): string[] {
  return [...document.querySelectorAll('.case-arch-arrow')].map((node) => node.textContent ?? '')
}
