import { LIVES_PER_ROUND } from '../../domain/constants'
import { gallowsImage } from '../../ui/images'
import styles from './Gallows.module.css'

interface GallowsProps {
  lives: number
  /** Mirrors the artwork so each player's gallows faces their own panel. */
  mirrored?: boolean
}

export function Gallows({ lives, mirrored = false }: GallowsProps) {
  const wrongGuesses = LIVES_PER_ROUND - lives
  return (
    <img
      className={mirrored ? `${styles.image} ${styles.mirrored}` : styles.image}
      src={gallowsImage(wrongGuesses)}
      alt={`${wrongGuesses} de ${LIVES_PER_ROUND} intentos fallidos`}
    />
  )
}
