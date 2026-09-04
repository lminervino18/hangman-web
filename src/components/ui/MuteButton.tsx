import { useState } from 'react'
import { setMuted } from '../../audio/audioManager'
import styles from './MuteButton.module.css'

export function MuteButton() {
  const [muted, setMutedState] = useState(false)

  function toggle() {
    const next = !muted
    setMutedState(next)
    setMuted(next)
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={toggle}
      aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
      aria-pressed={muted}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
