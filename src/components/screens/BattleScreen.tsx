import { useEffect, useRef } from 'react'
import { playKeyPressSound } from '../../audio/audioManager'
import { isGuessValid } from '../../domain/guess'
import { maskedDisplay } from '../../domain/round'
import type { GameState } from '../../domain/types'
import { OnScreenKeyboard } from '../ui/OnScreenKeyboard'
import { PlayerPanel } from '../ui/PlayerPanel'
import styles from './BattleScreen.module.css'

interface BattleScreenProps {
  state: GameState
  onGuessChange: (value: string) => void
  onGuessSubmit: () => void
}

export function BattleScreen({ state, onGuessChange, onGuessSubmit }: BattleScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { round, players, activePlayer, currentInput } = state

  useEffect(() => {
    inputRef.current?.focus()
  }, [activePlayer])

  const revealedLetters = new Set(
    round.cells.filter((cell) => cell.revealed).map((cell) => cell.letter),
  )
  const wrongLetters = new Set(round.wrongEntries.filter((entry) => entry.length === 1))

  const trimmedInput = currentInput.trim().toUpperCase()
  const isValidGuess =
    trimmedInput.length > 0 && isGuessValid(round.cells, round.wrongEntries, trimmedInput)
  const inputStateClass =
    trimmedInput.length === 0 ? '' : isValidGuess ? styles.valid : styles.invalid

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!isValidGuess) return
    onGuessSubmit()
  }

  function handleKeyboardClick(letter: string) {
    playKeyPressSound()
    onGuessChange(currentInput + letter)
    inputRef.current?.focus()
  }

  return (
    <div className={styles.layout}>
      <PlayerPanel
        playerId="player1"
        player={players.player1}
        isActive={activePlayer === 'player1'}
      />

      <div className={styles.center}>
        <p className={styles.lastWord} data-testid="last-word">
          {state.lastCompletedWord ? `LAST WORD: ${state.lastCompletedWord}` : ' '}
        </p>
        <p className={styles.turn} data-testid="turn-indicator">
          Turn of {players[activePlayer].name.toUpperCase()}
        </p>
        <p className={styles.word} data-testid="masked-word">
          {maskedDisplay(round.cells)}
        </p>
        <p className={styles.hint}>TRY ONE LETTER OR THE WHOLE WORD (1 SHOT)</p>
        <p className={styles.wrongLetters} data-testid="wrong-entries">
          {round.wrongEntries.join(', ')}
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            data-testid="guess-input"
            className={`${styles.input} ${inputStateClass}`}
            value={currentInput}
            onChange={(event) => onGuessChange(event.target.value)}
            onKeyDown={() => playKeyPressSound()}
            autoComplete="off"
          />
          <button type="submit" className={styles.submit} disabled={!isValidGuess}>
            Guess
          </button>
        </form>

        <OnScreenKeyboard
          revealedLetters={revealedLetters}
          wrongLetters={wrongLetters}
          onLetterClick={handleKeyboardClick}
        />
      </div>

      <PlayerPanel
        playerId="player2"
        player={players.player2}
        isActive={activePlayer === 'player2'}
        mirrored
      />
    </div>
  )
}
