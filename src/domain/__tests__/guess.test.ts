import { describe, expect, it } from 'vitest'
import { applyFullWordGuess, applySingleLetterGuess, isGuessValid } from '../guess'
import type { LetterCell } from '../types'

function cellsFor(word: string, revealedLetters: string[] = []): LetterCell[] {
  return word.split('').map((letter) => ({
    letter,
    revealed: revealedLetters.includes(letter),
  }))
}

describe('isGuessValid', () => {
  it('accepts a letter that has not been tried', () => {
    const cells = cellsFor('ABAD')
    expect(isGuessValid(cells, [], 'A')).toBe(true)
  })

  it('rejects a letter that is already revealed', () => {
    const cells = cellsFor('ABAD', ['A'])
    expect(isGuessValid(cells, [], 'A')).toBe(false)
  })

  it('rejects a letter that was already tried and was wrong', () => {
    const cells = cellsFor('ABAD')
    expect(isGuessValid(cells, ['Z'], 'Z')).toBe(false)
  })

  it('rejects a full-word guess of the wrong length', () => {
    const cells = cellsFor('ABAD')
    expect(isGuessValid(cells, [], 'AB')).toBe(false)
  })

  it('accepts a full-word guess consistent with revealed letters', () => {
    const cells = cellsFor('ABAD', ['A'])
    expect(isGuessValid(cells, [], 'AXAX')).toBe(true)
  })

  it('rejects a full-word guess inconsistent with a revealed letter', () => {
    const cells = cellsFor('ABAD', ['A'])
    expect(isGuessValid(cells, [], 'XBAD')).toBe(false)
  })

  it('rejects an empty guess', () => {
    const cells = cellsFor('ABAD')
    expect(isGuessValid(cells, [], '')).toBe(false)
  })
})

describe('applySingleLetterGuess', () => {
  it('reveals every occurrence of a correct letter', () => {
    const cells = cellsFor('ABAD')
    const result = applySingleLetterGuess(cells, 'A')
    expect(result.hit).toBe(true)
    expect(result.cells.map((c) => c.revealed)).toEqual([true, false, true, false])
  })

  it('reports a miss and leaves cells untouched for a letter not in the word', () => {
    const cells = cellsFor('ABAD')
    const result = applySingleLetterGuess(cells, 'Z')
    expect(result.hit).toBe(false)
    expect(result.cells).toEqual(cells)
  })
})

describe('applyFullWordGuess', () => {
  it('reveals the whole word on an exact match', () => {
    const cells = cellsFor('ABAD')
    const result = applyFullWordGuess(cells, 'ABAD')
    expect(result.correct).toBe(true)
    expect(result.cells.every((c) => c.revealed)).toBe(true)
  })

  it('leaves cells untouched when the guess does not match', () => {
    const cells = cellsFor('ABAD')
    const result = applyFullWordGuess(cells, 'ABAK')
    expect(result.correct).toBe(false)
    expect(result.cells).toEqual(cells)
  })
})
