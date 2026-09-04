import { pickRandomWord } from './wordPool'
import type { GameDependencies, PlayerId } from './types'

export function pickRandomStartingPlayer(): PlayerId {
  return Math.random() < 0.5 ? 'player1' : 'player2'
}

export const defaultGameDependencies: GameDependencies = {
  pickWord: pickRandomWord,
  pickStartingPlayer: pickRandomStartingPlayer,
  random: Math.random,
}
