import {
  INITIAL_MUSIC_VOLUME,
  LIVES_PER_ROUND,
  MAX_MUSIC_VOLUME,
  MUSIC_VOLUME_STEP,
} from '../constants'
import { applyFullWordGuess, applySingleLetterGuess, isGuessValid } from '../guess'
import { createRound, fullWord, isRoundComplete, mistakeCount } from '../round'
import { STREAK_MILESTONES } from './constants'
import type {
  SingleplayerAction,
  SingleplayerDependencies,
  SingleplayerEvent,
  SingleplayerReducerResult,
  SingleplayerState,
} from './types'

const MAX_PICK_ATTEMPTS = 100

/** Avoids repeating a word already drawn this run, falling back to a repeat only if the pool is effectively exhausted. */
function pickUnusedWord(usedWords: readonly string[], pickWord: () => string): string {
  const used = new Set(usedWords)
  for (let attempt = 0; attempt < MAX_PICK_ATTEMPTS; attempt += 1) {
    const candidate = pickWord()
    if (!used.has(candidate)) return candidate
  }
  return pickWord()
}

export function createInitialRun(
  deps: SingleplayerDependencies,
  bestStreak: number,
): SingleplayerState {
  const firstWord = pickUnusedWord([], deps.pickWord)
  return {
    status: 'playing',
    streak: 0,
    bestStreak,
    isNewBestStreak: false,
    milestone: null,
    usedWords: [firstWord],
    history: [],
    round: createRound(firstWord, deps.random),
    currentInput: '',
    musicVolume: INITIAL_MUSIC_VOLUME,
  }
}

function increaseVolume(state: SingleplayerState): SingleplayerState {
  return {
    ...state,
    musicVolume: Math.min(MAX_MUSIC_VOLUME, state.musicVolume + MUSIC_VOLUME_STEP),
  }
}

function completeWord(
  state: SingleplayerState,
  word: string,
  events: SingleplayerEvent[],
): SingleplayerReducerResult {
  const streak = state.streak + 1
  const milestone = STREAK_MILESTONES.includes(streak) ? streak : null
  events.push('wordComplete')
  if (milestone !== null) events.push('milestone')

  const next = increaseVolume({
    ...state,
    status: 'transitioning',
    streak,
    milestone,
    currentInput: '',
    history: [...state.history, { word, outcome: 'success' }],
  })
  return { state: next, events }
}

function endRun(
  state: SingleplayerState,
  word: string,
  events: SingleplayerEvent[],
): SingleplayerReducerResult {
  const isNewBestStreak = state.streak > state.bestStreak
  events.push('runEnded')
  if (isNewBestStreak) events.push('newRecord')

  return {
    state: {
      ...state,
      status: 'ended',
      currentInput: '',
      isNewBestStreak,
      bestStreak: Math.max(state.streak, state.bestStreak),
      history: [...state.history, { word, outcome: 'failed' }],
    },
    events,
  }
}

function resolveGuess(state: SingleplayerState): SingleplayerReducerResult {
  const guess = state.currentInput
  const { cells, wrongEntries } = state.round

  if (!isGuessValid(cells, wrongEntries, guess)) {
    return { state, events: [] }
  }

  const events: SingleplayerEvent[] = []

  if (guess.length === 1) {
    const outcome = applySingleLetterGuess(cells, guess)

    if (!outcome.hit) {
      const nextWrongEntries = [...wrongEntries, guess]
      events.push('wrongLetter')

      if (mistakeCount(nextWrongEntries) >= LIVES_PER_ROUND) {
        return endRun(state, fullWord(cells), events)
      }

      return {
        state: {
          ...state,
          currentInput: '',
          round: { ...state.round, wrongEntries: nextWrongEntries },
        },
        events,
      }
    }

    events.push('roundPoint')
    const stateWithReveal: SingleplayerState = {
      ...state,
      currentInput: '',
      round: { ...state.round, cells: outcome.cells },
    }
    if (isRoundComplete(outcome.cells)) {
      return completeWord(stateWithReveal, fullWord(outcome.cells), events)
    }
    return { state: stateWithReveal, events }
  }

  const outcome = applyFullWordGuess(cells, guess)
  if (!outcome.correct) {
    return endRun(state, fullWord(cells), events)
  }
  const stateWithReveal: SingleplayerState = {
    ...state,
    currentInput: '',
    round: { ...state.round, cells: outcome.cells },
  }
  return completeWord(stateWithReveal, fullWord(outcome.cells), events)
}

export function applyRunAction(
  state: SingleplayerState,
  action: SingleplayerAction,
  deps: SingleplayerDependencies,
): SingleplayerReducerResult {
  switch (action.type) {
    case 'GUESS_DRAFT_CHANGED': {
      if (state.status !== 'playing') return { state, events: [] }
      return { state: { ...state, currentInput: action.value }, events: [] }
    }

    case 'GUESS_SUBMITTED': {
      if (state.status !== 'playing') return { state, events: [] }
      return resolveGuess(state)
    }

    case 'ADVANCE_ROUND': {
      if (state.status !== 'transitioning') return { state, events: [] }
      const nextWord = pickUnusedWord(state.usedWords, deps.pickWord)
      return {
        state: {
          ...state,
          status: 'playing',
          milestone: null,
          currentInput: '',
          usedWords: [...state.usedWords, nextWord],
          round: createRound(nextWord, deps.random),
        },
        events: [],
      }
    }

    case 'RESTART_RUN': {
      if (state.status !== 'ended') return { state, events: [] }
      return { state: createInitialRun(deps, state.bestStreak), events: [] }
    }

    default:
      return { state, events: [] }
  }
}
