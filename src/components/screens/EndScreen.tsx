import { useKeyPress } from '../../hooks/useKeyPress'
import type { GameState } from '../../domain/types'
import { IMAGES } from '../../ui/images'
import { Button } from '../ui/Button'
import { LastWordLink } from '../ui/LastWordLink'
import styles from './EndScreen.module.css'

interface EndScreenProps {
  state: GameState
  onRestart: () => void
}

export function EndScreen({ state, onRestart }: EndScreenProps) {
  useKeyPress('Enter', onRestart)

  const winnerName = state.winner ? state.players[state.winner].name : ''

  return (
    <div className={styles.container}>
      <img className={styles.banner} src={IMAGES.youWinBanner} alt="" />
      <h1 className={styles.winner} data-testid="winner-name">
        ¡{winnerName} gana la partida!
      </h1>
      <LastWordLink word={state.lastCompletedWord} />
      <Button onClick={onRestart}>Jugar de nuevo</Button>
    </div>
  )
}
