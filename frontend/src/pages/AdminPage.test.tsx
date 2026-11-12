import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppProviders } from '../test/providers'
import AdminPage from './AdminPage'

function renderAdmin() {
  return render(
    <AppProviders>
      <AdminPage />
    </AppProviders>,
  )
}

function setNativeValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
}

describe('AdminPage phone login', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('disables iOS autocorrect and autocapitalize on the login fields', () => {
    renderAdmin()
    const username = screen.getByLabelText('Username')
    const password = screen.getByLabelText('Password')
    expect(username).toHaveAttribute('autocapitalize', 'none')
    expect(username).toHaveAttribute('autocorrect', 'off')
    expect(username).toHaveAttribute('spellcheck', 'false')
    expect(password).toHaveAttribute('autocapitalize', 'none')
    expect(password).toHaveAttribute('autocomplete', 'current-password')
  })

  it('submits the DOM values when autofill does not fire onChange', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Authentication failed' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    renderAdmin()

    setNativeValue(screen.getByLabelText('Username') as HTMLInputElement, ' admin ')
    setNativeValue(screen.getByLabelText('Password') as HTMLInputElement, ' secret ')
    fireEvent.submit(screen.getByLabelText('Username').closest('form')!)

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const body = JSON.parse(String(fetchMock.mock.calls[0][1].body)) as {
      username: string
      password: string
    }
    expect(body).toEqual({ username: 'admin', password: ' secret ' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Authentication failed.')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('sends the bearer when loading messages after login', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ csrfToken: 'csrf-1', sessionToken: 'phone-token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 20,
        }),
      })
    vi.stubGlobal('fetch', fetchMock)
    renderAdmin()

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const messages = fetchMock.mock.calls[1][1] as { headers: Record<string, string>; credentials: string }
    expect(messages.credentials).toBe('include')
    expect(messages.headers.Authorization).toBe('Bearer phone-token')
    expect(await screen.findByText('Contact messages')).toBeInTheDocument()
  })

  it('does not call a dropped cookie a wrong password', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ csrfToken: 'csrf-1', sessionToken: 'phone-token' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Authentication failed' }),
      })
    vi.stubGlobal('fetch', fetchMock)
    renderAdmin()

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/did not keep the admin session/i)
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })
})
