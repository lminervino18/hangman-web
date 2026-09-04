import { LIVES_PER_ROUND } from '../domain/constants'

const IMAGE_BASE = '/assets/images'

export const IMAGES = {
  introPerson: `${IMAGE_BASE}/intro-person.png`,
  youWinBanner: `${IMAGE_BASE}/you-win-banner.png`,
  heart: `${IMAGE_BASE}/heart.png`,
  trophy: `${IMAGE_BASE}/trophy.png`,
} as const

export function gallowsImage(wrongGuesses: number): string {
  const stage = Math.min(LIVES_PER_ROUND, Math.max(0, wrongGuesses))
  return `${IMAGE_BASE}/gallows/gallows-${stage}.png`
}
