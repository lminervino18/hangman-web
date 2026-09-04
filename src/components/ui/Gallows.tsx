import { LIVES_PER_ROUND } from '../../domain/constants'
import styles from './Gallows.module.css'

interface GallowsProps {
  lives: number
  /** Mirrors the artwork so each player's gallows faces their own panel. */
  mirrored?: boolean
}

export function Gallows({ lives, mirrored = false }: GallowsProps) {
  const wrongGuesses = Math.min(LIVES_PER_ROUND, LIVES_PER_ROUND - lives)
  return (
    <img
      className={mirrored ? `${styles.image} ${styles.mirrored}` : styles.image}
      src={`/assets/images/gallows/gallows-${wrongGuesses}.png`}
      alt={`${wrongGuesses} of ${LIVES_PER_ROUND} wrong guesses`}
    />
  )
}
