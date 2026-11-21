import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readApiCache } from '../api'
import { AppProviders } from '../test/providers'
import AdminContentEditors from './AdminContentEditors'

const experience = {
  id: 1,
  companyEn: 'Acme',
  companyFr: '',
  roleEn: 'Engineer',
  roleFr: '',
  startDate: '2020',
  endDate: '2021',
  locationEn: '',
  locationFr: '',
  highlightsEn: '',
  highlightsFr: '',
  sortOrder: 1,
}

function json(body: unknown, ok = true) {
  return { ok, status: ok ? 200 : 500, json: async () => body }
}

function mockAdmin(handlers?: { experience?: unknown[] }) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'
    if (method !== 'GET') return json({})
    if (url.includes('/api/experience')) return json(handlers?.experience ?? [experience])
    if (url.includes('/api/projects')) return json([])
    if (url.includes('/api/skills')) return json([])
    if (url.includes('/api/about')) return json({ education: [] })
    return json({})
  })
}

function renderEditors(panel: 'experience' | 'cv' = 'experience') {
  return render(
    <AppProviders>
      <AdminContentEditors csrfToken="csrf" sessionToken="token" panel={panel} />
    </AppProviders>,
  )
}

describe('AdminContentEditors', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('keeps saved records read-only until Edit, then shows Saved', async () => {
    const fetchMock = mockAdmin()
    vi.stubGlobal('fetch', fetchMock)
    renderEditors()

    expect(await screen.findByText('Acme')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Company (EN)')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByLabelText('Company (EN)')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Saved')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByLabelText('Company (EN)')).not.toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(true)
  })

  it('still deletes a read-only record', async () => {
    const fetchMock = mockAdmin({ experience: [] })
    let deleted = false
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'
      if (method === 'DELETE') {
        deleted = true
        return json({})
      }
      if (url.includes('/api/experience')) return json(deleted ? [] : [experience])
      if (url.includes('/api/about')) return json({ education: [] })
      return json([])
    })
    vi.stubGlobal('fetch', fetchMock)
    renderEditors()

    expect(await screen.findByText('Acme')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(deleted).toBe(true)
      expect(screen.queryByText('Acme')).not.toBeInTheDocument()
    })
    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
  })

  it('writes the saved project list, including the cover, into the public fallback cache', async () => {
    const savedProject = {
      id: 2,
      slug: 'second-project',
      nameEn: 'Second Project',
      nameFr: '',
      summaryEn: '',
      summaryFr: '',
      tagsEn: '',
      tagsFr: '',
      href: '',
      coverImageUrl: '/media/uploads/second.png',
      sortOrder: 1,
    }
    let saved = false
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'
      if (method === 'POST' && url.includes('/api/admin/projects')) {
        saved = true
        return json({ id: savedProject.id }, true)
      }
      if (method === 'GET' && url.includes('/api/projects')) {
        return json(saved ? [savedProject] : [])
      }
      if (url.includes('/api/about')) return json({ education: [] })
      return json([])
    })
    vi.stubGlobal('fetch', fetchMock)
    localStorage.clear()

    render(
      <AppProviders>
        <AdminContentEditors csrfToken="csrf" sessionToken="token" panel="projects" />
      </AppProviders>,
    )

    await waitFor(() => {
      expect(readApiCache('/api/projects')).toEqual([])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    fireEvent.change(screen.getByLabelText('Slug'), { target: { value: savedProject.slug } })
    fireEvent.change(screen.getByLabelText('Name (EN)'), {
      target: { value: savedProject.nameEn },
    })
    fireEvent.change(screen.getByLabelText('URL (optional)'), {
      target: { value: savedProject.coverImageUrl },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(readApiCache('/api/projects')).toEqual([savedProject])
    })
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
    expect(JSON.parse(String(post?.[1]?.body)).coverImageUrl).toBe(savedProject.coverImageUrl)
    expect(await screen.findByText('Saved')).toBeInTheDocument()
  })

  it('shows Saved after a CV upload', async () => {
    const fetchMock = mockAdmin()
    vi.stubGlobal('fetch', fetchMock)
    renderEditors('cv')

    const input = await screen.findByLabelText(/english/i)
    const file = new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: /replace english cv/i }))

    expect(await screen.findByText('Saved')).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(true)
  })
})
