import { useEffect } from 'react'
import type { GameState } from '../../domain/types'
import styles from './EndScreen.module.css'

interface EndScreenProps {
  state: GameState
  onRestart: () => void
}

export function EndScreen({ state, onRestart }: EndScreenProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter') onRestart()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onRestart])

  const winnerName = state.winner ? state.players[state.winner].name.toUpperCase() : ''

  return (
    <div className={styles.container}>
      <img className={styles.banner} src="/assets/images/you-win-banner.png" alt="" />
      <h1 className={styles.winner} data-testid="winner-name">
        {winnerName}!
      </h1>
      <p className={styles.lastWord}>LAST WORD: {state.lastCompletedWord}</p>
      <button type="button" className={styles.button} onClick={onRestart}>
        Play again
      </button>
    </div>
  )
}
