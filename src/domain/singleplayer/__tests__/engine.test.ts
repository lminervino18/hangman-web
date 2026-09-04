import { describe, expect, it } from 'vitest'
import { LIVES_PER_ROUND } from '../../constants'
import { applyRunAction, createInitialRun } from '../engine'
import { STREAK_MILESTONES } from '../constants'
import type {
  SingleplayerAction,
  SingleplayerDependencies,
  SingleplayerState,
} from '../types'

function makeDeps(
  words: string[],
  random: () => number = () => 0,
): SingleplayerDependencies {
  let index = 0
  return {
    pickWord: () => {
      const word = words[index % words.length]
      index += 1
      if (word === undefined) throw new Error('ran out of test words')
      return word
    },
    random,
  }
}

function run(
  state: SingleplayerState,
  action: SingleplayerAction,
  deps: SingleplayerDependencies,
): SingleplayerState {
  return applyRunAction(state, action, deps).state
}

function submitGuess(
  state: SingleplayerState,
  guess: string,
  deps: SingleplayerDependencies,
) {
  const afterInput = run(state, { type: 'GUESS_DRAFT_CHANGED', value: guess }, deps)
  return applyRunAction(afterInput, { type: 'GUESS_SUBMITTED' }, deps)
}

describe('createInitialRun', () => {
  it('starts with streak 0 and a fresh round', () => {
    const state = createInitialRun(makeDeps(['GATO']), 0)
    expect(state.streak).toBe(0)
    expect(state.status).toBe('playing')
    expect(state.history).toEqual([])
    expect(state.round.word).toBe('GATO')
  })

  it('carries forward the best streak passed in', () => {
    const state = createInitialRun(makeDeps(['GATO']), 12)
    expect(state.bestStreak).toBe(12)
  })
})

describe('completing a word', () => {
  it('increments the streak exactly once and enters a transition', () => {
    const deps = makeDeps(['AB', 'CD'])
    const state = createInitialRun(deps, 0)
    const result = submitGuess(state, 'B', deps)
    expect(result.state.streak).toBe(1)
    expect(result.state.status).toBe('transitioning')
    expect(result.events).toContain('wordComplete')
  })

  it('records the completed word in history as a success', () => {
    const deps = makeDeps(['AB', 'CD'])
    const state = createInitialRun(deps, 0)
    const result = submitGuess(state, 'B', deps)
    expect(result.state.history).toEqual([{ word: 'AB', outcome: 'success' }])
  })

  it('reveals the winning letter in round.cells during the transition, not just in history', () => {
    const deps = makeDeps(['AB', 'CD'])
    const state = createInitialRun(deps, 0)
    const result = submitGuess(state, 'B', deps)
    expect(result.state.round.cells.every((cell) => cell.revealed)).toBe(true)
  })

  it('reveals the full word in round.cells after a winning full-word guess too', () => {
    const deps = makeDeps(['ABC', 'DE'])
    const state = createInitialRun(deps, 0)
    // 'A' is pre-revealed; "ABC" is the correct full word.
    const result = submitGuess(state, 'ABC', deps)
    expect(result.state.round.cells.every((cell) => cell.revealed)).toBe(true)
  })

  it('locks guesses during the transition', () => {
    const deps = makeDeps(['AB', 'CD'])
    const state = createInitialRun(deps, 0)
    const transitioning = submitGuess(state, 'B', deps).state
    const draftAttempt = { ...transitioning, currentInput: 'X' }
    const submitResult = applyRunAction(draftAttempt, { type: 'GUESS_SUBMITTED' }, deps)
    expect(submitResult.state).toBe(draftAttempt)

    const draftResult = applyRunAction(
      transitioning,
      { type: 'GUESS_DRAFT_CHANGED', value: 'X' },
      deps,
    )
    expect(draftResult.state).toBe(transitioning)
  })

  it('advancing after the transition resets round state but preserves the streak', () => {
    const deps = makeDeps(['AB', 'CD'])
    const state = createInitialRun(deps, 0)
    const transitioning = submitGuess(state, 'B', deps).state
    const next = run(transitioning, { type: 'ADVANCE_ROUND' }, deps)
    expect(next.status).toBe('playing')
    expect(next.streak).toBe(1)
    expect(next.round.word).toBe('CD')
    expect(next.round.wrongEntries).toEqual([])
    expect(next.milestone).toBeNull()
  })

  it('does not repeat a word already used this run', () => {
    const deps = makeDeps(['AB', 'AB', 'CD'])
    const state = createInitialRun(deps, 0)
    const transitioning = submitGuess(state, 'B', deps).state
    const next = run(transitioning, { type: 'ADVANCE_ROUND' }, deps)
    // pickWord would return 'AB' again first, so the engine must skip it
    expect(next.round.word).toBe('CD')
  })
})

describe('losing a word', () => {
  function loseCurrentWord(state: SingleplayerState, deps: SingleplayerDependencies) {
    let result = submitGuess(state, 'Q', deps)
    for (let i = 0; i < LIVES_PER_ROUND - 1; i += 1) {
      result = submitGuess(result.state, String.fromCharCode(82 + i), deps) // R, S, T, U
    }
    return result
  }

  it('ends the run after exhausting the lives for the current word', () => {
    const deps = makeDeps(['ZXCVBN'])
    const state = createInitialRun(deps, 0)
    const result = loseCurrentWord(state, deps)
    expect(result.state.status).toBe('ended')
    expect(result.events).toContain('runEnded')
  })

  it('records the failed word in history', () => {
    const deps = makeDeps(['ZXCVBN'])
    const state = createInitialRun(deps, 0)
    const result = loseCurrentWord(state, deps)
    expect(result.state.history.at(-1)).toEqual({ word: 'ZXCVBN', outcome: 'failed' })
  })

  it('a wrong full-word guess also ends the run immediately', () => {
    const deps = makeDeps(['GATO'])
    const state = createInitialRun(deps, 0)
    // 'G' is pre-revealed (random: 0); "GXYZ" stays consistent with it but is wrong.
    const result = submitGuess(state, 'GXYZ', deps)
    expect(result.state.status).toBe('ended')
    expect(result.state.history).toEqual([{ word: 'GATO', outcome: 'failed' }])
  })
})

describe('restarting a run', () => {
  it('resets the streak and history but keeps the best streak', () => {
    const deps = makeDeps(['ZXCVBN', 'AB'])
    const state = createInitialRun(deps, 0)
    const ended = submitGuess(state, 'ZXXXXX', deps).state
    expect(ended.status).toBe('ended')

    const restarted = run(ended, { type: 'RESTART_RUN' }, deps)
    expect(restarted.streak).toBe(0)
    expect(restarted.history).toEqual([])
    expect(restarted.status).toBe('playing')
    expect(restarted.bestStreak).toBe(ended.bestStreak)
  })

  it('is a no-op while a run is still active', () => {
    const deps = makeDeps(['AB'])
    const state = createInitialRun(deps, 0)
    const result = applyRunAction(state, { type: 'RESTART_RUN' }, deps)
    expect(result.state).toBe(state)
  })
})

describe('best streak tracking', () => {
  it('flags a new best streak only when the run beats the previous best', () => {
    const deps = makeDeps(['AB', 'ZXCVBN'])
    let state = createInitialRun(deps, 1)
    state = submitGuess(state, 'B', deps).state // streak -> 1, transitioning
    state = run(state, { type: 'ADVANCE_ROUND' }, deps)
    const result = submitGuess(state, 'ZXXXXX', deps) // fails at streak 1, ties best (not a new record)
    expect(result.state.isNewBestStreak).toBe(false)
    expect(result.state.bestStreak).toBe(1)
  })

  it('reports a new best streak when the run exceeds the previous best', () => {
    const deps = makeDeps(['AB', 'ZXCVBN'])
    let state = createInitialRun(deps, 0)
    state = submitGuess(state, 'B', deps).state
    state = run(state, { type: 'ADVANCE_ROUND' }, deps)
    const result = submitGuess(state, 'ZXXXXX', deps)
    expect(result.state.isNewBestStreak).toBe(true)
    expect(result.state.bestStreak).toBe(1)
    expect(result.events).toContain('newRecord')
  })

  it('never decreases the best streak', () => {
    const deps = makeDeps(['ZXCVBN'])
    const state = createInitialRun(deps, 10)
    const result = submitGuess(state, 'ZXXXXX', deps)
    expect(result.state.bestStreak).toBe(10)
  })
})

describe('milestones', () => {
  it('is flagged only when the new streak matches a configured milestone', () => {
    expect(STREAK_MILESTONES).toContain(5)
    // 5 two-letter words; random: 0 always pre-reveals the first letter,
    // so guessing the second letter completes each one.
    const words = ['AB', 'CD', 'EF', 'GH', 'IJ']
    const deps = makeDeps(words)
    let state = createInitialRun(deps, 0)
    let lastEvents: string[] = []
    for (const word of words) {
      const secondLetter = word[1]!
      const result = submitGuess(state, secondLetter, deps)
      lastEvents = [...result.events]
      state = run(result.state, { type: 'ADVANCE_ROUND' }, deps)
    }
    expect(state.streak).toBe(5)
    expect(lastEvents).toContain('milestone')
  })

  it('does not flag a milestone on a non-milestone streak', () => {
    const deps = makeDeps(['AB', 'CD'])
    const state = createInitialRun(deps, 0)
    const result = submitGuess(state, 'B', deps)
    expect(result.state.streak).toBe(1)
    expect(result.state.milestone).toBeNull()
    expect(result.events).not.toContain('milestone')
  })
})
