import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
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
})
