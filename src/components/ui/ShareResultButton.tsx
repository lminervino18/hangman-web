import { useEffect, useState } from 'react'
import { useKeyPress } from '../../hooks/useKeyPress'
import type { ResultCardData } from '../../sharing/resultImage'
import { generateResultImage } from '../../sharing/resultImage'
import {
  canShareFile,
  copyResultText,
  downloadResultImage,
  shareResultImage,
} from '../../sharing/shareResult'
import { Button } from './Button'
import styles from './ShareResultButton.module.css'

type Status = 'idle' | 'generating' | 'preview' | 'error'

interface ShareResultButtonProps {
  buildCardData: () => ResultCardData
  shareTitle: string
  shareText: string
}

export function ShareResultButton({
  buildCardData,
  shareTitle,
  shareText,
}: ShareResultButtonProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [copyFeedback, setCopyFeedback] = useState(false)

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  useKeyPress('Escape', () => {
    if (status === 'preview' || status === 'error') closePreview()
  })

  async function openPreview() {
    setStatus('generating')
    try {
      const blob = await generateResultImage(buildCardData())
      setImageBlob(blob)
      setImageUrl(URL.createObjectURL(blob))
      setStatus('preview')
    } catch {
      setStatus('error')
    }
  }

  function closePreview() {
    setStatus('idle')
    setImageBlob(null)
    setImageUrl(null)
  }

  async function handleNativeShare() {
    if (!imageBlob) return
    try {
      const outcome = await shareResultImage(imageBlob, shareTitle, shareText)
      if (outcome === 'shared') closePreview()
    } catch {
      // Unsupported or failed: the download/copy actions below still work.
    }
  }

  function handleDownload() {
    if (imageBlob) downloadResultImage(imageBlob)
  }

  async function handleCopyText() {
    const copied = await copyResultText(shareText)
    setCopyFeedback(copied)
    window.setTimeout(() => setCopyFeedback(false), 2000)
  }

  const canNativeShare =
    imageBlob !== null &&
    canShareFile(new File([imageBlob], 'r.png', { type: 'image/png' }))

  return (
    <>
      <Button
        variant="secondary"
        onClick={openPreview}
        disabled={status === 'generating'}
      >
        {status === 'generating' ? 'Generando…' : 'Compartir resultado'}
      </Button>

      {(status === 'preview' || status === 'error') && (
        <div className={styles.backdrop} onClick={closePreview}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-label="Vista previa para compartir"
            onClick={(event) => event.stopPropagation()}
          >
            {status === 'error' && (
              <p className={styles.error}>No se pudo generar la imagen para compartir.</p>
            )}
            {status === 'preview' && imageUrl && (
              <img
                className={styles.preview}
                src={imageUrl}
                alt="Vista previa del resultado"
              />
            )}
            <div className={styles.actions}>
              {status === 'preview' && canNativeShare && (
                <Button onClick={handleNativeShare}>Compartir</Button>
              )}
              {status === 'preview' && (
                <Button variant="secondary" onClick={handleDownload}>
                  Descargar imagen
                </Button>
              )}
              <Button variant="secondary" onClick={handleCopyText}>
                {copyFeedback ? 'Texto copiado' : 'Copiar texto'}
              </Button>
              <Button variant="secondary" onClick={closePreview}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
