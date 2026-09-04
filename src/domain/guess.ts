import type { LetterCell } from './types'

/**
 * A guess is valid to submit when it is either:
 * - a single letter that hasn't already been revealed or already tried, or
 * - a full attempt at the word (matching its length) that stays consistent
 *   with every letter already revealed.
 *
 * This mirrors the original `try_is_valid`: it only gates what may be
 * submitted, it does not itself decide whether the guess is *correct*.
 */
export function isGuessValid(
  cells: readonly LetterCell[],
  wrongEntries: readonly string[],
  guess: string,
): boolean {
  if (guess.length === 0) return false
  if (wrongEntries.includes(guess)) return false

  if (guess.length === 1) {
    const alreadyRevealed = cells.some((cell) => cell.revealed && cell.letter === guess)
    return !alreadyRevealed
  }

  if (guess.length !== cells.length) return false

  return cells.every((cell, index) => !cell.revealed || cell.letter === guess[index])
}

export interface SingleLetterOutcome {
  readonly cells: readonly LetterCell[]
  readonly hit: boolean
}

/** Reveals every occurrence of `letter` in the word. */
export function applySingleLetterGuess(
  cells: readonly LetterCell[],
  letter: string,
): SingleLetterOutcome {
  const hit = cells.some((cell) => cell.letter === letter && !cell.revealed)

  if (!hit) {
    return { cells, hit: false }
  }

  const nextCells = cells.map((cell) =>
    cell.letter === letter ? { ...cell, revealed: true } : cell,
  )
  return { cells: nextCells, hit: true }
}

export interface FullWordOutcome {
  readonly cells: readonly LetterCell[]
  readonly correct: boolean
}

/** Reveals the whole word if `guess` matches it exactly, otherwise leaves it untouched. */
export function applyFullWordGuess(
  cells: readonly LetterCell[],
  guess: string,
): FullWordOutcome {
  const correct = cells.every((cell, index) => cell.letter === guess[index])

  if (!correct) {
    return { cells, correct: false }
  }

  return { cells: cells.map((cell) => ({ ...cell, revealed: true })), correct: true }
}
