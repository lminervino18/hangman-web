import { useKeyPress } from '../../hooks/useKeyPress'
import type { SingleplayerState } from '../../domain/singleplayer/types'
import type { ResultCardData } from '../../sharing/resultImage'
import { PALETTE } from '../../ui/palette'
import { Button } from '../ui/Button'
import { Journey } from '../ui/Journey'
import { LastWordLink } from '../ui/LastWordLink'
import { ShareResultButton } from '../ui/ShareResultButton'
import styles from './SingleplayerResultScreen.module.css'

interface SingleplayerResultScreenProps {
  state: SingleplayerState
  onRestart: () => void
  onExit: () => void
}

export function SingleplayerResultScreen({
  state,
  onRestart,
  onExit,
}: SingleplayerResultScreenProps) {
  useKeyPress('Enter', onRestart)
  useKeyPress('r', onRestart)

  const lastWord = state.history.at(-1)?.word ?? ''
  const wordLabel = state.streak === 1 ? 'palabra' : 'palabras'

  function buildCardData(): ResultCardData {
    return {
      heading: `Racha: ${state.streak}`,
      subheading: `Mejor racha: ${state.bestStreak}`,
      badge: state.isNewBestStreak ? '¡Nuevo récord!' : undefined,
      journey: state.history.map((entry) => ({
        word: entry.word,
        accentColor: entry.outcome === 'success' ? PALETTE.green : PALETTE.red,
      })),
    }
  }

  const shareText = `Llegué a una racha de ${state.streak} ${wordLabel} en The Hangman Game.`

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Racha terminada</h1>
      <p className={styles.streak} data-testid="final-streak">
        Llegaste a {state.streak} {wordLabel} seguidas.
      </p>
      {state.isNewBestStreak && (
        <p className={styles.record} data-testid="new-record-banner">
          ¡Nuevo récord!
        </p>
      )}
      <LastWordLink word={lastWord} label="La palabra era" testId="last-word" />

      <Journey
        items={state.history.map((entry) => ({
          word: entry.word,
          accentColor:
            entry.outcome === 'success' ? 'var(--color-green)' : 'var(--color-red)',
        }))}
      />

      <div className={styles.actions}>
        <Button onClick={onRestart}>Jugar de nuevo</Button>
        <ShareResultButton
          buildCardData={buildCardData}
          shareTitle={`Racha: ${state.streak}`}
          shareText={shareText}
        />
        <Button variant="secondary" onClick={onExit}>
          Menú principal
        </Button>
      </div>
    </div>
  )
}
