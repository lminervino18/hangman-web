import { describe, expect, it } from 'vitest'
import { createRound, fullWord, isRoundComplete, maskedDisplay } from '../round'

describe('createRound', () => {
  it('normalizes the word and reveals every occurrence of one random letter', () => {
    // "ABAD" -> letters A,B,A,D. random() picking index 0 selects 'A',
    // which appears at indices 0 and 2.
    const round = createRound('abad', () => 0)
    expect(round.word).toBe('ABAD')
    expect(round.cells.map((c) => c.revealed)).toEqual([true, false, true, false])
  })

  it('reveals a different letter depending on the random index', () => {
    // index 1 -> 'B', which only appears once.
    const round = createRound('abad', () => 0.26)
    expect(round.cells.map((c) => c.revealed)).toEqual([false, true, false, false])
  })

  it('starts with no wrong entries', () => {
    const round = createRound('abad', () => 0)
    expect(round.wrongEntries).toEqual([])
  })
})

describe('maskedDisplay', () => {
  it('shows revealed letters and hides the rest', () => {
    const round = createRound('abad', () => 0)
    expect(maskedDisplay(round.cells)).toBe('A _ A _')
  })
})

describe('isRoundComplete / fullWord', () => {
  it('is not complete until every cell is revealed', () => {
    const round = createRound('abad', () => 0)
    expect(isRoundComplete(round.cells)).toBe(false)
  })

  it('is complete once every cell is revealed', () => {
    const round = createRound('abad', () => 0)
    const revealed = round.cells.map((c) => ({ ...c, revealed: true }))
    expect(isRoundComplete(revealed)).toBe(true)
    expect(fullWord(revealed)).toBe('ABAD')
  })
})
