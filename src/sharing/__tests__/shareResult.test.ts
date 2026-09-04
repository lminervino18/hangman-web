import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  canShareFile,
  copyResultText,
  downloadResultImage,
  shareResultImage,
} from '../shareResult'

const pngFile = () => new File(['x'], 'result.png', { type: 'image/png' })

describe('canShareFile', () => {
  afterEach(() => {
    // @ts-expect-error - test-only cleanup of a browser API not present in jsdom by default
    delete navigator.canShare
  })

  it('is false when the browser has no canShare support', () => {
    expect(canShareFile(pngFile())).toBe(false)
  })

  it('reflects navigator.canShare when present', () => {
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: vi.fn(() => true),
    })
    expect(canShareFile(pngFile())).toBe(true)
  })
})

describe('shareResultImage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    // @ts-expect-error - test-only cleanup
    delete navigator.canShare
    // @ts-expect-error - test-only cleanup
    delete navigator.share
  })

  it('throws when native sharing is unsupported, so callers know to fall back', async () => {
    await expect(shareResultImage(new Blob(['x']), 't', 'x')).rejects.toThrow()
  })

  it('resolves to "shared" when navigator.share succeeds', async () => {
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: () => true,
    })
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })

    const outcome = await shareResultImage(new Blob(['x']), 'Racha: 5', 'texto')
    expect(outcome).toBe('shared')
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Racha: 5', text: 'texto' }),
    )
  })

  it('resolves to "cancelled" when the user dismisses the share sheet', async () => {
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: () => true,
    })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')),
    })

    await expect(shareResultImage(new Blob(['x']), 't', 'x')).resolves.toBe('cancelled')
  })

  it('rethrows unexpected share errors', async () => {
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: () => true,
    })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockRejectedValue(new Error('boom')),
    })

    await expect(shareResultImage(new Blob(['x']), 't', 'x')).rejects.toThrow('boom')
  })
})

describe('downloadResultImage', () => {
  it('creates and clicks a temporary link, then revokes the object URL', () => {
    const createObjectURL = vi.fn(() => 'blob:fake-url')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })

    const clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') el.click = clickSpy
      return el
    })

    downloadResultImage(new Blob(['x'], { type: 'image/png' }), 'test.png')

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake-url')
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })
})

describe('copyResultText', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns false when the clipboard API is unavailable', async () => {
    expect(await copyResultText('hola')).toBe(false)
  })

  it('returns true when the clipboard write succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    expect(await copyResultText('hola')).toBe(true)
    expect(writeText).toHaveBeenCalledWith('hola')
  })

  it('returns false when the clipboard write is rejected', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    })
    expect(await copyResultText('hola')).toBe(false)
  })
})
