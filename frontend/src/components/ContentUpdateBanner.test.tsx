import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleContext'
import ContentUpdateBanner from './ContentUpdateBanner'

function renderBanner(path = '/') {
  return render(
    <LocaleProvider>
      <MemoryRouter initialEntries={[path]}>
        <ContentUpdateBanner />
      </MemoryRouter>
    </LocaleProvider>,
  )
}

describe('ContentUpdateBanner', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Promise.resolve({
          ok: true,
          json: async () => ({ revision: 1 }),
        }),
      ),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('stays hidden while revision is unchanged', async () => {
    renderBanner()
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(screen.queryByText(/refresh the page/i)).toBeNull()
  })

  it('shows a dismissible notice when revision changes', async () => {
    const user = userEvent.setup()
    let revision = 1
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Promise.resolve({
          ok: true,
          json: async () => ({ revision }),
        }),
      ),
    )

    renderBanner()
    await waitFor(() => expect(fetch).toHaveBeenCalled())

    revision = 2
    window.dispatchEvent(new Event('focus'))

    expect(await screen.findByText(/refresh the page/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /dismiss content update/i }))
    expect(screen.queryByText(/refresh the page/i)).toBeNull()
  })

  it('does not render on the admin route', async () => {
    renderBanner('/admin')
    await new Promise((r) => setTimeout(r, 20))
    expect(fetch).not.toHaveBeenCalled()
    expect(screen.queryByText(/refresh the page/i)).toBeNull()
  })
})
