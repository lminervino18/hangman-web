import {
  INITIAL_MUSIC_VOLUME,
  LIVES_PER_ROUND,
  MAX_MUSIC_VOLUME,
  MUSIC_VOLUME_STEP,
  POINTS_TO_WIN_MATCH,
} from './constants'
import { applyFullWordGuess, applySingleLetterGuess, isGuessValid } from './guess'
import { validatePlayerName } from './playerName'
import { createRound, fullWord, isRoundComplete } from './round'
import type {
  GameAction,
  GameDependencies,
  GameEvent,
  GameState,
  PlayerId,
  ReducerResult,
} from './types'

const emptyPlayer = { name: '', lives: LIVES_PER_ROUND, points: 0 }

export function createInitialState(deps: GameDependencies): GameState {
  return {
    screen: 'intro',
    nameEntryTarget: 'player1',
    nameEntryDraft: '',
    players: {
      player1: { ...emptyPlayer },
      player2: { ...emptyPlayer },
    },
    activePlayer: deps.pickStartingPlayer(),
    currentInput: '',
    round: { word: '', cells: [], wrongEntries: [] },
    winner: null,
    lastCompletedWord: '',
    musicVolume: INITIAL_MUSIC_VOLUME,
  }
}

function otherPlayer(id: PlayerId): PlayerId {
  return id === 'player1' ? 'player2' : 'player1'
}

function startNextRound(state: GameState, deps: GameDependencies): GameState {
  return {
    ...state,
    activePlayer: otherPlayer(state.activePlayer),
    currentInput: '',
    round: createRound(deps.pickWord(), deps.random),
    players: {
      player1: { ...state.players.player1, lives: LIVES_PER_ROUND },
      player2: { ...state.players.player2, lives: LIVES_PER_ROUND },
    },
  }
}

function increaseVolume(state: GameState): GameState {
  return {
    ...state,
    musicVolume: Math.min(MAX_MUSIC_VOLUME, state.musicVolume + MUSIC_VOLUME_STEP),
  }
}

function withPoint(state: GameState, winner: PlayerId): GameState {
  return {
    ...state,
    players: {
      ...state.players,
      [winner]: { ...state.players[winner], points: state.players[winner].points + 1 },
    },
  }
}

function checkMatchWinner(state: GameState): { state: GameState; won: boolean } {
  const winnerId = (Object.keys(state.players) as PlayerId[]).find(
    (id) => state.players[id].points >= POINTS_TO_WIN_MATCH,
  )
  if (!winnerId) return { state, won: false }
  return {
    state: { ...state, screen: 'end', winner: winnerId },
    won: true,
  }
}

function resolveGuess(state: GameState, deps: GameDependencies): ReducerResult {
  const guess = state.currentInput
  const { cells, wrongEntries } = state.round

  if (!isGuessValid(cells, wrongEntries, guess)) {
    return { state, events: [] }
  }

  const guesser = state.activePlayer
  const events: GameEvent[] = []

  if (guess.length === 1) {
    const outcome = applySingleLetterGuess(cells, guess)

    if (!outcome.hit) {
      const lives = state.players[guesser].lives - 1
      let next: GameState = {
        ...state,
        currentInput: '',
        round: { ...state.round, wrongEntries: [...wrongEntries, guess] },
        players: { ...state.players, [guesser]: { ...state.players[guesser], lives } },
      }
      events.push('wrongLetter')

      if (lives <= 0) {
        next = { ...next, lastCompletedWord: fullWord(cells) }
        next = withPoint(next, otherPlayer(guesser))
        next = startNextRound(next, deps)
        events.push('wrongWordAttempt', 'nextRound')
        const { state: withWinner, won } = checkMatchWinner(next)
        if (won) events.push('matchWon')
        return { state: withWinner, events }
      }

      next = { ...next, activePlayer: otherPlayer(guesser) }
      return { state: next, events }
    }

    events.push('roundPoint')
    let next: GameState = {
      ...state,
      currentInput: '',
      round: { ...state.round, cells: outcome.cells },
    }

    if (isRoundComplete(outcome.cells)) {
      events.push('wordComplete', 'nextRound')
      next = { ...next, lastCompletedWord: fullWord(outcome.cells) }
      next = increaseVolume(withPoint(next, guesser))
      next = startNextRound(next, deps)
      const { state: withWinner, won } = checkMatchWinner(next)
      if (won) events.push('matchWon')
      return { state: withWinner, events }
    }

    next = { ...next, activePlayer: otherPlayer(guesser) }
    return { state: next, events }
  }

  const outcome = applyFullWordGuess(cells, guess)

  if (!outcome.correct) {
    let next: GameState = {
      ...state,
      currentInput: '',
      lastCompletedWord: fullWord(cells),
      round: { ...state.round, wrongEntries: [...wrongEntries, guess] },
    }
    next = increaseVolume(withPoint(next, otherPlayer(guesser)))
    next = startNextRound(next, deps)
    events.push('wrongWordAttempt', 'nextRound')
    const { state: withWinner, won } = checkMatchWinner(next)
    if (won) events.push('matchWon')
    return { state: withWinner, events }
  }

  let next: GameState = {
    ...state,
    currentInput: '',
    lastCompletedWord: fullWord(outcome.cells),
    round: { ...state.round, cells: outcome.cells },
  }
  next = increaseVolume(withPoint(next, guesser))
  next = startNextRound(next, deps)
  events.push('wordComplete', 'nextRound')
  const { state: withWinner, won } = checkMatchWinner(next)
  if (won) events.push('matchWon')
  return { state: withWinner, events }
}

export function applyAction(
  state: GameState,
  action: GameAction,
  deps: GameDependencies,
): ReducerResult {
  switch (action.type) {
    case 'START_GAME': {
      if (state.screen !== 'intro') return { state, events: [] }
      return {
        state: {
          ...state,
          screen: 'nameEntry',
          nameEntryTarget: 'player1',
          nameEntryDraft: '',
        },
        events: [],
      }
    }

    case 'NAME_DRAFT_CHANGED': {
      if (state.screen !== 'nameEntry') return { state, events: [] }
      return { state: { ...state, nameEntryDraft: action.value }, events: [] }
    }

    case 'NAME_SUBMITTED': {
      if (state.screen !== 'nameEntry') return { state, events: [] }
      const name = validatePlayerName(state.nameEntryDraft)
      if (name === null) return { state, events: [] }

      const target = state.nameEntryTarget
      const withName: GameState = {
        ...state,
        players: { ...state.players, [target]: { ...state.players[target], name } },
      }

      if (target === 'player1') {
        return {
          state: { ...withName, nameEntryTarget: 'player2', nameEntryDraft: '' },
          events: [],
        }
      }

      const battleState: GameState = {
        ...withName,
        screen: 'battle',
        nameEntryDraft: '',
        activePlayer: deps.pickStartingPlayer(),
        round: createRound(deps.pickWord(), deps.random),
      }
      return { state: battleState, events: ['nextRound'] }
    }

    case 'GUESS_DRAFT_CHANGED': {
      if (state.screen !== 'battle') return { state, events: [] }
      return { state: { ...state, currentInput: action.value }, events: [] }
    }

    case 'GUESS_SUBMITTED': {
      if (state.screen !== 'battle') return { state, events: [] }
      return resolveGuess(state, deps)
    }

    case 'MATCH_RESTARTED': {
      if (state.screen !== 'end') return { state, events: [] }
      return { state: createInitialState(deps), events: [] }
    }

    default:
      return { state, events: [] }
  }
}

export { otherPlayer }
