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
})
