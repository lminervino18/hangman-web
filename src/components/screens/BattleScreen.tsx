import { useEffect, useRef } from 'react'
import { playKeyPressSound } from '../../audio/audioManager'
import { isGuessValid } from '../../domain/guess'
import { maskedDisplay } from '../../domain/round'
import type { GameState } from '../../domain/types'
import { Button } from '../ui/Button'
import { LastWordLink } from '../ui/LastWordLink'
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
    // Auto-focusing on a touch device would pop the on-screen keyboard open
    // as soon as the battle starts, fighting the game's own on-screen
    // keyboard. Only desktop/pointer players get the convenience.
    const prefersTouch = window.matchMedia('(pointer: coarse)').matches
    if (!prefersTouch) inputRef.current?.focus()
  }, [])

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
        <LastWordLink word={state.lastCompletedWord} testId="last-word" />
        <p className={styles.turn} data-testid="turn-indicator">
          Turno de {players[activePlayer].name}
        </p>
        <p className={styles.word} data-testid="masked-word">
          {maskedDisplay(round.cells)}
        </p>
        <p className={styles.hint}>
          Probá una letra o arriesgá la palabra completa (1 intento)
        </p>
        <p className={styles.wrongLetters} data-testid="wrong-entries">
          {round.wrongEntries.length > 0 &&
            `Incorrectas: ${round.wrongEntries.join(', ')}`}
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            data-testid="guess-input"
            className={`${styles.input} ${inputStateClass}`}
            value={currentInput}
            onChange={(event) => onGuessChange(event.target.value)}
            onKeyDown={() => playKeyPressSound()}
            aria-label="Letra o palabra completa"
            placeholder="Letra o palabra"
            autoComplete="off"
          />
          <Button type="submit" disabled={!isValidGuess}>
            Adivinar
          </Button>
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
