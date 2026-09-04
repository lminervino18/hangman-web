import { pickRandomWord } from '../wordPool'
import type { SingleplayerDependencies } from './types'

export const defaultSingleplayerDependencies: SingleplayerDependencies = {
  pickWord: pickRandomWord,
  random: Math.random,
}
