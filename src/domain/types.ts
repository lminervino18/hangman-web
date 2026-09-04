import type { RoundState } from './sharedTypes'

export type { LetterCell, RoundState } from './sharedTypes'

export type PlayerId = 'player1' | 'player2'

export type ScreenId = 'nameEntry' | 'battle' | 'end'

export interface PlayerState {
  readonly name: string
  readonly lives: number
  readonly points: number
}

export interface RoundHistoryEntry {
  readonly word: string
  readonly winner: PlayerId
}

export interface GameState {
  readonly screen: ScreenId
  readonly nameEntryTarget: PlayerId
  readonly nameEntryDraft: string
  readonly players: Record<PlayerId, PlayerState>
  readonly activePlayer: PlayerId
  readonly currentInput: string
  readonly round: RoundState
  readonly winner: PlayerId | null
  readonly lastCompletedWord: string
  readonly musicVolume: number
  readonly history: readonly RoundHistoryEntry[]
}

export type GameAction =
  | { type: 'NAME_DRAFT_CHANGED'; value: string }
  | { type: 'NAME_SUBMITTED' }
  | { type: 'GUESS_DRAFT_CHANGED'; value: string }
  | { type: 'GUESS_SUBMITTED' }
  | { type: 'REMATCH' }

export interface GameDependencies {
  readonly pickWord: () => string
  readonly pickStartingPlayer: () => PlayerId
  /** Returns a float in [0, 1); used to pick the free starting letter of a round. */
  readonly random: () => number
}

export type GameEvent =
  | 'roundPoint'
  | 'wrongLetter'
  | 'wordComplete'
  | 'wrongWordAttempt'
  | 'nextRound'
  | 'matchWon'

export interface ReducerResult {
  readonly state: GameState
  readonly events: readonly GameEvent[]
}
