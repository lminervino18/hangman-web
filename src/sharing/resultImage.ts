export interface ResultCardJourneyItem {
  readonly word: string
  readonly accentColor: string
}

export interface ResultCardData {
  readonly heading: string
  readonly subheading?: string
  readonly badge?: string
  readonly journey: readonly ResultCardJourneyItem[]
}

const CARD_WIDTH = 1080
const CARD_HEIGHT = 1350
const MARGIN = 72
const MAX_JOURNEY_CHIPS = 24
const FONT_FAMILY = "'Comic Neue', 'Comic Sans MS', sans-serif"

function wrapChips(
  ctx: CanvasRenderingContext2D,
  items: readonly ResultCardJourneyItem[],
  startY: number,
  bottomLimit: number,
): void {
  const chipHeight = 44
  const chipGap = 14
  const paddingX = 20
  const maxWidth = CARD_WIDTH - MARGIN * 2

  ctx.font = `600 26px ${FONT_FAMILY}`
  ctx.textBaseline = 'middle'

  let x = MARGIN
  let y = startY
  const shown = items.slice(0, MAX_JOURNEY_CHIPS)
  const hiddenCount = items.length - shown.length

  for (const item of shown) {
    const textWidth = ctx.measureText(item.word).width
    const chipWidth = textWidth + paddingX * 2

    if (x + chipWidth > MARGIN + maxWidth) {
      x = MARGIN
      y += chipHeight + chipGap
    }
    if (y + chipHeight > bottomLimit) break

    ctx.fillStyle = item.accentColor
    roundRect(ctx, x, y, chipWidth, chipHeight, chipHeight / 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.fillText(item.word, x + paddingX, y + chipHeight / 2 + 1)

    x += chipWidth + chipGap
  }

  if (hiddenCount > 0 && y + chipHeight <= bottomLimit) {
    const label = `+${hiddenCount} más`
    const textWidth = ctx.measureText(label).width
    const chipWidth = textWidth + paddingX * 2
    if (x + chipWidth > MARGIN + maxWidth) {
      x = MARGIN
      y += chipHeight + chipGap
    }
    if (y + chipHeight <= bottomLimit) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
      roundRect(ctx, x, y, chipWidth, chipHeight, chipHeight / 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.fillText(label, x + paddingX, y + chipHeight / 2 + 1)
    }
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

/** Renders a shareable result card client-side and resolves to a PNG blob. */
export async function generateResultImage(data: ResultCardData): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context is not available')

  if (typeof document.fonts?.ready?.then === 'function') {
    await document.fonts.ready
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT)
  gradient.addColorStop(0, '#300944')
  gradient.addColorStop(1, '#5b2a63')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  ctx.textAlign = 'center'

  ctx.font = `700 34px ${FONT_FAMILY}`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
  ctx.fillText('THE HANGMAN GAME', CARD_WIDTH / 2, 150)

  ctx.font = `700 92px ${FONT_FAMILY}`
  ctx.fillStyle = '#ffffff'
  ctx.fillText(data.heading, CARD_WIDTH / 2, 340)

  let nextY = 420
  if (data.subheading) {
    ctx.font = `600 46px ${FONT_FAMILY}`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.fillText(data.subheading, CARD_WIDTH / 2, nextY)
    nextY += 70
  }

  if (data.badge) {
    ctx.font = `700 40px ${FONT_FAMILY}`
    const badgeWidth = ctx.measureText(data.badge).width + 64
    const badgeX = CARD_WIDTH / 2 - badgeWidth / 2
    ctx.fillStyle = '#f6b93b'
    roundRect(ctx, badgeX, nextY, badgeWidth, 68, 34)
    ctx.fill()
    ctx.fillStyle = '#300944'
    ctx.textBaseline = 'middle'
    ctx.fillText(data.badge, CARD_WIDTH / 2, nextY + 36)
    ctx.textBaseline = 'alphabetic'
    nextY += 68 + 50
  } else {
    nextY += 30
  }

  if (data.journey.length > 0) {
    ctx.textAlign = 'left'
    ctx.font = `700 32px ${FONT_FAMILY}`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillText('Tu recorrido', MARGIN, nextY)
    wrapChips(ctx, data.journey, nextY + 40, CARD_HEIGHT - 90)
  }

  ctx.textAlign = 'center'
  ctx.font = `500 26px ${FONT_FAMILY}`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
  ctx.fillText(
    'Jugá en el navegador, sin instalar nada',
    CARD_WIDTH / 2,
    CARD_HEIGHT - 36,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to generate the result image'))
    }, 'image/png')
  })
}

export const RESULT_IMAGE_DIMENSIONS = { width: CARD_WIDTH, height: CARD_HEIGHT }
