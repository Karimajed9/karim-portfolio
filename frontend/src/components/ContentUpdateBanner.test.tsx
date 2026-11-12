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
    expect(screen.queryByText(/can't reach the api/i)).toBeNull()
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

  it('shows the offline API banner on 502 from content-revision', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/health')) {
          return Promise.reject(new TypeError('Failed to fetch'))
        }
        return Promise.resolve({ ok: false, status: 502, json: async () => ({}) })
      }),
    )

    renderBanner()
    expect(await screen.findByText(/can't reach the api/i)).toBeInTheDocument()
    expect(screen.queryByText(/starting up/i)).toBeNull()
    expect(screen.queryByText(/refresh the page/i)).toBeNull()
  })

  it('shows offline when content-revision fetch throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/api/health')) {
          return Promise.reject(new TypeError('Failed to fetch'))
        }
        throw new TypeError('Failed to fetch')
      }),
    )

    renderBanner()
    expect(await screen.findByText(/can't reach the api/i)).toBeInTheDocument()
  })

  it('stays quiet on empty successful revision payloads', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Promise.resolve({
          ok: true,
          json: async () => ({}),
        }),
      ),
    )

    renderBanner()
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('does not render on the admin route', async () => {
    renderBanner('/admin')
    await new Promise((r) => setTimeout(r, 20))
    expect(fetch).not.toHaveBeenCalled()
    expect(screen.queryByText(/refresh the page/i)).toBeNull()
  })
})
