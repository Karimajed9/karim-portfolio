import { render, waitFor } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ScrollToTop from './ScrollToTop'

function NavigateButton() {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate('/projects/personal-portfolio-platform')}>
      Explore
    </button>
  )
}

function ProjectsCrumb() {
  return <Link to="/#projects">Projects</Link>
}

function LocationProbe() {
  const location = useLocation()
  return (
    <span data-testid="loc">
      {location.pathname}
      {location.hash}
    </span>
  )
}

describe('ScrollToTop', () => {
  beforeEach(() => {
    window.scrollTo(0, 400)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('scrolls to the top when the pathname changes', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    const { findByRole } = render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<NavigateButton />} />
          <Route path="/projects/:slug" element={<p>Case</p>} />
        </Routes>
      </MemoryRouter>,
    )

    ;(await findByRole('button', { name: 'Explore' })).click()

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
  })

  it('scrolls to the projects section when the hash is projects', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollIntoView = scrollIntoView

    const { findByRole } = render(
      <MemoryRouter initialEntries={['/projects/flowforge']}>
        <ScrollToTop />
        <LocationProbe />
        <Routes>
          <Route path="/projects/:slug" element={<ProjectsCrumb />} />
          <Route path="/" element={<section id="projects">Projects</section>} />
        </Routes>
      </MemoryRouter>,
    )

    const callsBefore = scrollTo.mock.calls.length
    ;(await findByRole('link', { name: 'Projects' })).click()

    await waitFor(() => {
      expect(document.querySelector('[data-testid="loc"]')?.textContent).toBe('/#projects')
    })
    const projects = document.getElementById('projects')
    expect(projects).not.toBeNull()
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
    expect(scrollIntoView.mock.instances[0]).toBe(projects)
    expect(scrollTo.mock.calls.length).toBe(callsBefore)
  })
})
