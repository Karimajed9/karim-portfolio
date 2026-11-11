import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppProviders } from '../test/providers'
import ContactPage from './ContactPage'

function renderContact() {
  return render(
    <AppProviders>
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    </AppProviders>,
  )
}

describe('ContactPage spam protection', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('rejects a filled honeypot without calling the API', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderContact()

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Karim' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'karim@example.com' } })
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Hello there friend' },
    })
    fireEvent.change(screen.getByLabelText('Website'), {
      target: { value: 'https://spam.example' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/could not send message/i)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows an inline error when the API returns 429', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
      }),
    )

    renderContact()

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Karim' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'karim@example.com' } })
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Hello there friend' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/only one message per minute/i)
    })
  })
})
