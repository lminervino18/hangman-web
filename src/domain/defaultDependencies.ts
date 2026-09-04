import { WORDS } from '../data/words'
import type { GameDependencies, PlayerId } from './types'

export function pickRandomWord(): string {
  const index = Math.floor(Math.random() * WORDS.length)
  const word = WORDS[index]
  if (word === undefined) {
    throw new Error('WORDS list is empty')
  }
  return word
}

export function pickRandomStartingPlayer(): PlayerId {
  return Math.random() < 0.5 ? 'player1' : 'player2'
}

export const defaultGameDependencies: GameDependencies = {
  pickWord: pickRandomWord,
  pickStartingPlayer: pickRandomStartingPlayer,
  random: Math.random,
}
