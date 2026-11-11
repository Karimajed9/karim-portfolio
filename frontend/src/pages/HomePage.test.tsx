import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppProviders } from '../test/providers'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('renders the portfolio name as the hero heading', () => {
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
  })
})
