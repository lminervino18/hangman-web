import { normalizeWord } from './normalize'
import type { LetterCell, RoundState } from './sharedTypes'

/**
 * Builds a new round from a raw word, pre-revealing every occurrence of one
 * randomly chosen letter — matching the original game's "free letter" head
 * start, which reveals every position sharing the same letter as a single
 * randomly picked occurrence.
 */
export function createRound(rawWord: string, random: () => number): RoundState {
  const word = normalizeWord(rawWord)
  const letters = word.split('')
  const revealIndex = Math.floor(random() * letters.length)
  const freeLetter = letters[revealIndex]
  if (freeLetter === undefined) {
    throw new Error(`Cannot create a round from an empty word (raw: "${rawWord}")`)
  }

  const cells: LetterCell[] = letters.map((letter) => ({
    letter,
    revealed: letter === freeLetter,
  }))

  return { word, cells, wrongEntries: [] }
}

export function maskedDisplay(cells: readonly LetterCell[]): string {
  return cells.map((cell) => (cell.revealed ? cell.letter : '_')).join(' ')
}

export function isRoundComplete(cells: readonly LetterCell[]): boolean {
  return cells.every((cell) => cell.revealed)
}

export function fullWord(cells: readonly LetterCell[]): string {
  return cells.map((cell) => cell.letter).join('')
}

/** Only single-letter entries cost a life; a failed full-word guess ends the round outright. */
export function mistakeCount(wrongEntries: readonly string[]): number {
  return wrongEntries.filter((entry) => entry.length === 1).length
}
