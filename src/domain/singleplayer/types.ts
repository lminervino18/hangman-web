import type { RoundState } from '../sharedTypes'

export type RunStatus = 'playing' | 'transitioning' | 'ended'

export interface CompletedWord {
  readonly word: string
  readonly outcome: 'success' | 'failed'
}

export interface SingleplayerState {
  readonly status: RunStatus
  readonly streak: number
  readonly bestStreak: number
  readonly isNewBestStreak: boolean
  readonly milestone: number | null
  readonly usedWords: readonly string[]
  readonly history: readonly CompletedWord[]
  readonly round: RoundState
  readonly currentInput: string
  readonly musicVolume: number
}

export type SingleplayerAction =
  | { type: 'GUESS_DRAFT_CHANGED'; value: string }
  | { type: 'GUESS_SUBMITTED' }
  | { type: 'ADVANCE_ROUND' }
  | { type: 'RESTART_RUN' }

export interface SingleplayerDependencies {
  readonly pickWord: () => string
  readonly random: () => number
}

export type SingleplayerEvent =
  'roundPoint' | 'wrongLetter' | 'wordComplete' | 'milestone' | 'newRecord' | 'runEnded'

export interface SingleplayerReducerResult {
  readonly state: SingleplayerState
  readonly events: readonly SingleplayerEvent[]
}
