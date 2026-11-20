import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import StableCoverImage from './StableCoverImage'

vi.mock('../lib/mediaCache', () => ({
  readCachedMediaObjectUrl: vi.fn(async () => null),
  rememberMediaFromNetwork: vi.fn(async () => {}),
}))

describe('StableCoverImage', () => {
  it('keeps the img and switches to the fallback url when the cover errors', async () => {
    const { container } = render(
      <StableCoverImage
        src="https://api.example/media/uploads/cover.png"
        fallbackSrc="https://cdn.example/fallback.png"
        className="project-card-cover"
      />,
    )
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://api.example/media/uploads/cover.png')
    expect(img?.className).toBe('project-card-cover')

    fireEvent.error(img!)

    await waitFor(() => {
      expect(container.querySelector('img')).toHaveAttribute(
        'src',
        'https://cdn.example/fallback.png',
      )
    })
    expect(container.querySelectorAll('img')).toHaveLength(1)
  })
})
