import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  mediaPath,
  readCachedMediaObjectUrl,
  rememberUploadedMedia,
} from './mediaCache'

describe('media cache', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('reads an uploaded cover back from the stored media URL', async () => {
    const store = new Map<string, Response>()
    vi.stubGlobal('caches', {
      open: async () => ({
        match: async (key: string) => store.get(key),
        put: async (key: string, response: Response) => {
          store.set(key, response)
        },
      }),
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:stored-cover')

    rememberUploadedMedia('/media/uploads/cover.png', new Blob(['img'], { type: 'image/png' }))
    await vi.waitFor(() => expect(store.size).toBeGreaterThan(0))

    await expect(readCachedMediaObjectUrl('/media/uploads/cover.png')).resolves.toBe(
      'blob:stored-cover',
    )
    expect(mediaPath('https://api.example.com/media/uploads/cover.png')).toBe(
      '/media/uploads/cover.png',
    )
  })
})
