export function canShareFile(file: File): boolean {
  return typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })
}

export type ShareOutcome = 'shared' | 'cancelled'

/** Throws if native file sharing isn't supported; callers should check canShareFile first. */
export async function shareResultImage(
  blob: Blob,
  title: string,
  text: string,
): Promise<ShareOutcome> {
  const file = new File([blob], 'resultado-hangman.png', { type: 'image/png' })
  if (!canShareFile(file) || typeof navigator.share !== 'function') {
    throw new Error('Native sharing is not supported in this browser')
  }
  try {
    await navigator.share({ files: [file], title, text })
    return 'shared'
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    throw error
  }
}

export function downloadResultImage(
  blob: Blob,
  filename = 'resultado-hangman.png',
): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function copyResultText(text: string): Promise<boolean> {
  if (typeof navigator.clipboard?.writeText !== 'function') return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
