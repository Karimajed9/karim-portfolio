import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import SkillsPage from './pages/SkillsPage'
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
          { path: 'about', element: <AboutPage /> },
          { path: 'skills', element: <SkillsPage /> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  )

  return {
    user: userEvent.setup(),
    ...render(
      <AppProviders>
        <RouterProvider router={router} useTransitions={false} />
      </AppProviders>,
    ),
    router,
  }
}

describe('primary nav', () => {
  it('goes straight from About to Skills without rendering Home', async () => {
    const { user } = renderApp('/about')
    const main = screen.getByRole('main')

    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('About')
    expect(within(main).queryByRole('heading', { name: /Karim Majed/i })).not.toBeInTheDocument()

    await user.click(
      within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('link', {
        name: 'Skills',
      }),
    )

    expect(within(main).queryByRole('heading', { name: /Karim Majed/i })).not.toBeInTheDocument()
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Skills')
  })

  it('leaves Home for About in one step', async () => {
    const { user } = renderApp('/')
    const main = screen.getByRole('main')
    const nav = screen.getByRole('navigation', { name: 'Primary' })

    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Karim Majed')

    await user.click(within(nav).getByRole('link', { name: 'About' }))

    expect(within(main).queryByRole('heading', { name: /Karim Majed/i })).not.toBeInTheDocument()
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('About')
  })
})
