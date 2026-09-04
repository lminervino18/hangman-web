import { useEffect, useRef } from 'react'
import { playKeyPressSound } from '../../audio/audioManager'
import { isGuessValid } from '../../domain/guess'
import { LIVES_PER_ROUND } from '../../domain/constants'
import { maskedDisplay, mistakeCount } from '../../domain/round'
import type { SingleplayerState } from '../../domain/singleplayer/types'
import { milestoneMessage } from '../../ui/milestoneMessages'
import { Button } from '../ui/Button'
import { Gallows } from '../ui/Gallows'
import { OnScreenKeyboard } from '../ui/OnScreenKeyboard'
import styles from './SingleplayerRunScreen.module.css'

interface SingleplayerRunScreenProps {
  state: SingleplayerState
  onGuessChange: (value: string) => void
  onGuessSubmit: () => void
}

export function SingleplayerRunScreen({
  state,
  onGuessChange,
  onGuessSubmit,
}: SingleplayerRunScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { round, currentInput, streak, bestStreak, milestone, status } = state
  const isLocked = status !== 'playing'

  useEffect(() => {
    const prefersTouch = window.matchMedia('(pointer: coarse)').matches
    if (!prefersTouch) inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (status === 'playing') inputRef.current?.focus()
  }, [status])

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
    if (!isValidGuess || isLocked) return
    onGuessSubmit()
  }

  function handleKeyboardClick(letter: string) {
    if (isLocked) return
    playKeyPressSound()
    onGuessChange(currentInput + letter)
    inputRef.current?.focus()
  }

  return (
    <div className={styles.layout}>
      <div className={styles.streakRow}>
        <p className={styles.streak} data-testid="streak">
          Racha: {streak}
        </p>
        <p className={styles.bestStreak} data-testid="best-streak">
          Mejor racha: {bestStreak}
        </p>
      </div>

      <Gallows lives={LIVES_PER_ROUND - mistakeCount(round.wrongEntries)} />

      <div className={styles.transitionBanner}>
        {status === 'transitioning' && (
          <>
            <p className={styles.confirmedWord} data-testid="confirmed-word">
              ¡Correcto! {round.word}
            </p>
            {milestone !== null && (
              <p className={styles.milestone} data-testid="milestone-banner">
                {milestoneMessage(milestone)}
              </p>
            )}
          </>
        )}
      </div>

      <p className={styles.word} data-testid="masked-word">
        {maskedDisplay(round.cells)}
      </p>
      <p className={styles.hint}>
        Probá una letra o arriesgá la palabra completa (1 intento)
      </p>
      <p className={styles.wrongLetters} data-testid="wrong-entries">
        {round.wrongEntries.length > 0 && `Incorrectas: ${round.wrongEntries.join(', ')}`}
      </p>

      <form
        className={`${styles.form} ${isLocked ? styles.locked : ''}`}
        onSubmit={handleSubmit}
      >
        <input
          ref={inputRef}
          data-testid="guess-input"
          className={`${styles.input} ${inputStateClass}`}
          value={currentInput}
          onChange={(event) => onGuessChange(event.target.value)}
          onKeyDown={() => playKeyPressSound()}
          aria-label="Letra o palabra completa"
          placeholder="Letra o palabra"
          disabled={isLocked}
          autoComplete="off"
        />
        <Button type="submit" disabled={!isValidGuess || isLocked}>
          Adivinar
        </Button>
      </form>

      <div className={isLocked ? styles.locked : ''}>
        <OnScreenKeyboard
          revealedLetters={revealedLetters}
          wrongLetters={wrongLetters}
          onLetterClick={handleKeyboardClick}
        />
      </div>
    </div>
  )
}
