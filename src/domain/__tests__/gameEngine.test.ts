import { describe, expect, it } from 'vitest'
import { LIVES_PER_ROUND, POINTS_TO_WIN_MATCH } from '../constants'
import { applyAction, createInitialState } from '../gameEngine'
import type {
  GameAction,
  GameDependencies,
  GameState,
  PlayerId,
  ReducerResult,
} from '../types'

function makeDeps(
  words: string[],
  overrides: Partial<Pick<GameDependencies, 'pickStartingPlayer' | 'random'>> = {},
): GameDependencies {
  let index = 0
  return {
    pickWord: () => {
      const word = words[index % words.length]
      index += 1
      if (word === undefined) throw new Error('ran out of test words')
      return word
    },
    pickStartingPlayer: overrides.pickStartingPlayer ?? (() => 'player1'),
    random: overrides.random ?? (() => 0),
  }
}

function run(state: GameState, action: GameAction, deps: GameDependencies): GameState {
  return applyAction(state, action, deps).state
}

/** Drives intro -> nameEntry -> battle, with word "AB" as the first round. */
function reachBattle(deps: GameDependencies): GameState {
  let state = createInitialState(deps)
  state = run(state, { type: 'START_GAME' }, deps)
  state = run(state, { type: 'NAME_DRAFT_CHANGED', value: 'Ana' }, deps)
  state = run(state, { type: 'NAME_SUBMITTED' }, deps)
  state = run(state, { type: 'NAME_DRAFT_CHANGED', value: 'Beto' }, deps)
  state = run(state, { type: 'NAME_SUBMITTED' }, deps)
  return state
}

function submitGuess(state: GameState, guess: string, deps: GameDependencies) {
  const afterInput = run(state, { type: 'GUESS_DRAFT_CHANGED', value: guess }, deps)
  return applyAction(afterInput, { type: 'GUESS_SUBMITTED' }, deps)
}

/** Miss letters guaranteed not to appear in any word used by these tests. */
const SAFE_MISS_LETTERS = ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U']

/**
 * Submits wrong single-letter guesses turn by turn until the player who
 * started the round runs out of lives: since the turn passes on every
 * single-letter guess, that player takes ceil(2*LIVES_PER_ROUND-1 / 2) of
 * the misses and empties their lives first.
 */
function depleteRoundByMisses(state: GameState, deps: GameDependencies) {
  const submissionsNeeded = 2 * LIVES_PER_ROUND - 1
  const letters = SAFE_MISS_LETTERS.slice(0, submissionsNeeded)
  let result = submitGuess(state, letters[0]!, deps)
  for (let i = 1; i < letters.length; i += 1) {
    result = submitGuess(result.state, letters[i]!, deps)
  }
  return result
}

describe('screen transitions', () => {
  it('starts on the intro screen', () => {
    const state = createInitialState(makeDeps(['AB']))
    expect(state.screen).toBe('intro')
  })

  it('moves from intro to name entry for player1', () => {
    const deps = makeDeps(['AB'])
    const state = run(createInitialState(deps), { type: 'START_GAME' }, deps)
    expect(state.screen).toBe('nameEntry')
    expect(state.nameEntryTarget).toBe('player1')
  })

  it('collects both names in order and starts the battle with a fresh round', () => {
    const deps = makeDeps(['AB'])
    const state = reachBattle(deps)
    expect(state.screen).toBe('battle')
    expect(state.players.player1.name).toBe('Ana')
    expect(state.players.player2.name).toBe('Beto')
    expect(state.round.word).toBe('AB')
  })

  it('rejects an invalid name and stays on the same entry step', () => {
    const deps = makeDeps(['AB'])
    let state = run(createInitialState(deps), { type: 'START_GAME' }, deps)
    state = run(state, { type: 'NAME_DRAFT_CHANGED', value: 'A' }, deps)
    state = run(state, { type: 'NAME_SUBMITTED' }, deps)
    expect(state.screen).toBe('nameEntry')
    expect(state.nameEntryTarget).toBe('player1')
    expect(state.players.player1.name).toBe('')
  })

  it('starts each round with one letter already revealed', () => {
    const deps = makeDeps(['AB'])
    const state = reachBattle(deps)
    expect(state.round.cells).toEqual([
      { letter: 'A', revealed: true },
      { letter: 'B', revealed: false },
    ])
  })
})

describe('single-letter guesses', () => {
  it('reveals a correct letter and passes the turn', () => {
    const deps = makeDeps(['ABC'])
    const state = reachBattle(deps)
    const result = submitGuess(state, 'C', deps)
    expect(result.events).toContain('roundPoint')
    expect(result.state.round.cells.find((c) => c.letter === 'C')?.revealed).toBe(true)
    expect(result.state.activePlayer).toBe('player2')
  })

  it('loses a life on a wrong letter and passes the turn', () => {
    const deps = makeDeps(['ABC'])
    const state = reachBattle(deps)
    const result = submitGuess(state, 'Z', deps)
    expect(result.events).toContain('wrongLetter')
    expect(result.state.players.player1.lives).toBe(LIVES_PER_ROUND - 1)
    expect(result.state.activePlayer).toBe('player2')
  })

  it('rejects re-guessing an already revealed letter (no-op)', () => {
    const deps = makeDeps(['AB'])
    const state = reachBattle(deps)
    const result = submitGuess(state, 'A', deps)
    expect(result.events).toEqual([])
    expect(result.state.round).toEqual(state.round)
    expect(result.state.players).toEqual(state.players)
    expect(result.state.activePlayer).toBe(state.activePlayer)
  })

  it('rejects re-guessing a letter already marked wrong (no-op)', () => {
    const deps = makeDeps(['ABC'])
    const state = reachBattle(deps)
    const afterMiss = submitGuess(state, 'Z', deps).state
    const result = submitGuess(afterMiss, 'Z', deps)
    expect(result.events).toEqual([])
    expect(result.state.round).toEqual(afterMiss.round)
    expect(result.state.players).toEqual(afterMiss.players)
  })

  it('completing the word via a letter awards the point and starts a new round', () => {
    const deps = makeDeps(['AB', 'CD'])
    const state = reachBattle(deps)
    const result = submitGuess(state, 'B', deps)
    expect(result.events).toEqual(
      expect.arrayContaining(['roundPoint', 'wordComplete', 'nextRound']),
    )
    expect(result.state.players.player1.points).toBe(1)
    expect(result.state.round.word).toBe('CD')
    expect(result.state.lastCompletedWord).toBe('AB')
  })

  it('resets both players lives when a new round starts', () => {
    const deps = makeDeps(['AB', 'CD'])
    const state = reachBattle(deps)
    const result = submitGuess(state, 'B', deps)
    expect(result.state.players.player1.lives).toBe(LIVES_PER_ROUND)
    expect(result.state.players.player2.lives).toBe(LIVES_PER_ROUND)
  })
})

describe('losing all lives in a round', () => {
  it('awards the point to the opponent and starts a new round', () => {
    // "AXXXXX" reveals 'A' for free; the round's starter (player1) is the
    // one who eventually runs out of lives, since misses alternate turns.
    const deps = makeDeps(['AXXXXX', 'CD'])
    const state = reachBattle(deps)
    const lastResult = depleteRoundByMisses(state, deps)
    expect(lastResult.events).toContain('wrongWordAttempt')
    expect(lastResult.events).toContain('nextRound')
    expect(lastResult.state.players.player2.points).toBe(1)
    expect(lastResult.state.players.player1.points).toBe(0)
    expect(lastResult.state.round.word).toBe('CD')
  })
})

describe('full-word guesses', () => {
  it('awards the point to the guesser on a correct full-word guess', () => {
    const deps = makeDeps(['ABC', 'DEF'])
    const state = reachBattle(deps)
    const result = submitGuess(state, 'ABC', deps)
    expect(result.events).toContain('wordComplete')
    expect(result.state.players.player1.points).toBe(1)
    expect(result.state.round.word).toBe('DEF')
  })

  it('awards the point to the opponent on a wrong full-word guess (the "1 shot" risk)', () => {
    const deps = makeDeps(['ABC', 'DEF'])
    const state = reachBattle(deps)
    // 'A' is revealed for free; 'AYZ' stays consistent with it but is wrong.
    const result = submitGuess(state, 'AYZ', deps)
    expect(result.events).toContain('wrongWordAttempt')
    expect(result.state.players.player2.points).toBe(1)
    expect(result.state.players.player1.points).toBe(0)
    expect(result.state.round.word).toBe('DEF')
  })

  it('rejects a full-word guess of the wrong length (no-op)', () => {
    const deps = makeDeps(['ABC'])
    const state = reachBattle(deps)
    const result = submitGuess(state, 'AB', deps)
    expect(result.events).toEqual([])
    expect(result.state.round).toEqual(state.round)
    expect(result.state.players).toEqual(state.players)
  })
})

describe('turn alternation across rounds', () => {
  it('alternates the starting player on every new round, including after losing all lives', () => {
    const deps = makeDeps(['AXXXXX', 'BXXXXX', 'CXXXXX'])
    const state = reachBattle(deps) // player1 starts round 1
    expect(state.activePlayer).toBe('player1')

    const roundOne = depleteRoundByMisses(state, deps)
    // Round 1 ended by lives depletion; round 2 should start with player2.
    expect(roundOne.state.activePlayer).toBe('player2')

    // Deplete round 2 as well; it should flip back to player1 for round 3.
    const roundTwo = depleteRoundByMisses(roundOne.state, deps)
    expect(roundTwo.state.activePlayer).toBe('player1')
  })
})

/**
 * Plays one full-word guess that always awards the point to player1: a
 * correct guess when player1 is active, or a valid-but-wrong guess (which
 * hands the point to the opponent) when player2 is active.
 */
function scorePointForPlayer1(state: GameState, deps: GameDependencies) {
  const word = state.round.word
  const firstLetter = word[0] ?? ''
  const guess =
    state.activePlayer === 'player1' ? word : firstLetter + 'Z'.repeat(word.length - 1)
  return submitGuess(state, guess, deps)
}

describe('match win detection', () => {
  it('moves to the end screen once a player reaches the winning points', () => {
    const deps = makeDeps(['AB', 'CD', 'EF'])
    const state = reachBattle(deps)
    let lastResult: ReducerResult = { state, events: [] }
    for (let round = 0; round < POINTS_TO_WIN_MATCH; round += 1) {
      lastResult = scorePointForPlayer1(lastResult.state, deps)
    }
    expect(lastResult.events).toContain('matchWon')
    expect(lastResult.state.screen).toBe('end')
    expect(lastResult.state.winner).toBe('player1')
  })
})

describe('returning to the menu', () => {
  it('returns to a completely fresh initial state from the end screen', () => {
    const deps = makeDeps(['AB', 'CD', 'EF'])
    const state = reachBattle(deps)
    let lastResult: ReducerResult = { state, events: [] }
    for (let round = 0; round < POINTS_TO_WIN_MATCH; round += 1) {
      lastResult = scorePointForPlayer1(lastResult.state, deps)
    }
    expect(lastResult.state.screen).toBe('end')

    const restarted = run(lastResult.state, { type: 'RETURN_TO_MENU' }, deps)
    expect(restarted.screen).toBe('intro')
    expect(restarted.players.player1.name).toBe('')
    expect(restarted.players.player1.points).toBe(0)
    expect(restarted.winner).toBeNull()
  })

  it('also resets to a fresh state from mid-match, so leaving an active game works', () => {
    const deps = makeDeps(['AB'])
    const state = reachBattle(deps)
    const restarted = run(state, { type: 'RETURN_TO_MENU' }, deps)
    expect(restarted.screen).toBe('intro')
  })

  it('is a no-op from the intro screen itself', () => {
    const deps = makeDeps(['AB'])
    const state = createInitialState(deps)
    const result = applyAction(state, { type: 'RETURN_TO_MENU' }, deps)
    expect(result.state).toBe(state)
  })
})

describe('music volume', () => {
  it('increases when a round ends by a completed word', () => {
    const deps = makeDeps(['AB', 'CD'])
    const state = reachBattle(deps)
    const before = state.musicVolume
    const result = submitGuess(state, 'B', deps)
    expect(result.state.musicVolume).toBeGreaterThan(before)
  })

  it('does not increase when a round ends by lives depletion', () => {
    const deps = makeDeps(['AXXXXX', 'BXXXXX'])
    const state = reachBattle(deps)
    const before = state.musicVolume
    const result = depleteRoundByMisses(state, deps)
    expect(result.state.musicVolume).toBe(before)
  })
})

describe('starting player selection', () => {
  it('honors a starting player of player2', () => {
    const deps = makeDeps(['AB'], { pickStartingPlayer: () => 'player2' as PlayerId })
    const state = reachBattle(deps)
    expect(state.activePlayer).toBe('player2')
  })
})
