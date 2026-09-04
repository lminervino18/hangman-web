import { useKeyPress } from '../../hooks/useKeyPress'
import type { GameState } from '../../domain/types'
import type { ResultCardData } from '../../sharing/resultImage'
import { IMAGES } from '../../ui/images'
import { PALETTE } from '../../ui/palette'
import { Button } from '../ui/Button'
import { Journey } from '../ui/Journey'
import { LastWordLink } from '../ui/LastWordLink'
import { ShareResultButton } from '../ui/ShareResultButton'
import styles from './EndScreen.module.css'

interface EndScreenProps {
  state: GameState
  onRematch: () => void
  onExit: () => void
}

export function EndScreen({ state, onRematch, onExit }: EndScreenProps) {
  useKeyPress('Enter', onRematch)

  const winnerName = state.winner ? state.players[state.winner].name : ''
  const loser = state.winner === 'player1' ? 'player2' : 'player1'
  const loserName = state.players[loser].name
  const loserPoints = state.players[loser].points

  function buildCardData(): ResultCardData {
    return {
      heading: `¡${winnerName} gana!`,
      subheading: `${winnerName} 3 · ${loserName} ${loserPoints}`,
      journey: state.history.map((entry) => ({
        word: entry.word,
        accentColor: entry.winner === 'player1' ? PALETTE.violet : PALETTE.green,
      })),
    }
  }

  const shareText = `¡${winnerName} le ganó a ${loserName} en The Hangman Game!`

  return (
    <div className={styles.container}>
      <img className={styles.banner} src={IMAGES.youWinBanner} alt="" />
      <h1 className={styles.winner} data-testid="winner-name">
        ¡{winnerName} gana la partida!
      </h1>
      <LastWordLink word={state.lastCompletedWord} />

      <Journey
        items={state.history.map((entry) => ({
          word: entry.word,
          accentColor:
            entry.winner === 'player1' ? 'var(--color-violet)' : 'var(--color-green)',
          caption: state.players[entry.winner].name,
        }))}
      />

      <div className={styles.actions}>
        <Button onClick={onRematch}>Revancha</Button>
        <ShareResultButton
          buildCardData={buildCardData}
          shareTitle={`${winnerName} gana`}
          shareText={shareText}
        />
        <Button variant="secondary" onClick={onExit}>
          Menú principal
        </Button>
      </div>
    </div>
  )
}
