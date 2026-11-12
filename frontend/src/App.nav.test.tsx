import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import HomePage from './pages/HomePage'
import ContactPage from './pages/ContactPage'
import Layout from './components/Layout'
import { AppProviders } from './test/providers'

afterEach(() => {
  cleanup()
})

function renderApp(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <Layout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'contact', element: <ContactPage /> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  )

  return render(
    <AppProviders>
      <RouterProvider router={router} useTransitions={false} />
    </AppProviders>,
  )
}

describe('primary nav', () => {
  it('renders the architectural single-page home with section anchors', () => {
    renderApp('/')
    const main = screen.getByRole('main')
    const nav = screen.getByRole('navigation', { name: 'Primary' })

    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent(/Karim/)
    expect(within(main).getByRole('heading', { name: /Professional experience/i })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /Contact/i })).toHaveAttribute('href', '#contact')
    expect(document.getElementById('skills')).toBeTruthy()
    expect(screen.getAllByRole('navigation', { name: 'Sections' })).toHaveLength(1)
    expect(screen.queryByRole('navigation', { name: 'Site menu' })).not.toBeInTheDocument()
  })

  it('opens the section menu from the keyboard and releases scroll when it closes', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const menu = screen.getByRole('navigation', { name: 'Site menu' })
    expect(menu).toBeInTheDocument()
    expect(document.documentElement.classList.contains('nav-menu-open')).toBe(true)

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('navigation', { name: 'Site menu' })).not.toBeInTheDocument()
    expect(document.documentElement.classList.contains('nav-menu-open')).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(document.documentElement.style.overflow).not.toBe('hidden')

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    await user.click(within(screen.getByRole('navigation', { name: 'Site menu' })).getByRole('link', { name: 'Projects' }))
    expect(screen.queryByRole('navigation', { name: 'Site menu' })).not.toBeInTheDocument()
    expect(document.documentElement.classList.contains('nav-menu-open')).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('renders the dedicated contact route with the API form', () => {
    renderApp('/contact')
    const main = screen.getByRole('main')

    expect(within(main).queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    expect(within(main).getByRole('heading', { name: /^Contact$/i })).toBeInTheDocument()
    expect(within(main).getByRole('button', { name: 'Send message' })).toBeInTheDocument()
  })
})
