import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RESULT_IMAGE_DIMENSIONS, generateResultImage } from '../resultImage'

function makeStubContext(): CanvasRenderingContext2D {
  const gradient = { addColorStop: vi.fn() }
  return {
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 }) as TextMetrics),
    createLinearGradient: vi.fn(() => gradient as unknown as CanvasGradient),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    arcTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    set fillStyle(_v: string | CanvasGradient) {},
    set font(_v: string) {},
    set textAlign(_v: CanvasTextAlign) {},
    set textBaseline(_v: CanvasTextBaseline) {},
  } as unknown as CanvasRenderingContext2D
}

describe('generateResultImage', () => {
  let getContextSpy: ReturnType<typeof vi.spyOn>
  let toBlobSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => makeStubContext())
    toBlobSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation(function (this: HTMLCanvasElement, callback) {
        callback(new Blob(['fake-png-bytes'], { type: 'image/png' }))
      })
  })

  afterEach(() => {
    getContextSpy.mockRestore()
    toBlobSpy.mockRestore()
  })

  it('resolves to a PNG blob', async () => {
    const blob = await generateResultImage({ heading: 'Racha: 3', journey: [] })
    expect(blob.type).toBe('image/png')
  })

  it('renders at the documented card dimensions', async () => {
    let capturedWidth = 0
    let capturedHeight = 0
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'canvas') {
        Object.defineProperty(el, 'width', {
          get: () => capturedWidth,
          set: (v) => (capturedWidth = v),
        })
        Object.defineProperty(el, 'height', {
          get: () => capturedHeight,
          set: (v) => (capturedHeight = v),
        })
      }
      return el
    })

    await generateResultImage({ heading: 'Racha: 3', journey: [] })
    expect(capturedWidth).toBe(RESULT_IMAGE_DIMENSIONS.width)
    expect(capturedHeight).toBe(RESULT_IMAGE_DIMENSIONS.height)
    vi.restoreAllMocks()
  })

  it('does not throw on Spanish accented characters and Ñ in the journey', async () => {
    await expect(
      generateResultImage({
        heading: 'Racha: 2',
        subheading: 'Mejor racha: 5',
        badge: '¡Nuevo récord!',
        journey: [
          { word: 'MURCIÉLAGO', accentColor: '#43c606' },
          { word: 'NIÑO', accentColor: '#ea0c05' },
        ],
      }),
    ).resolves.toBeInstanceOf(Blob)
  })

  it('rejects when toBlob yields no blob', async () => {
    toBlobSpy.mockImplementation(function (
      this: HTMLCanvasElement,
      callback: BlobCallback,
    ) {
      callback(null)
    })
    await expect(
      generateResultImage({ heading: 'Racha: 0', journey: [] }),
    ).rejects.toThrow()
  })
})
