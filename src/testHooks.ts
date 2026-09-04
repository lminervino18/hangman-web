import type { GameDependencies, PlayerId } from './domain/types'
import type { SingleplayerDependencies } from './domain/singleplayer/types'

/**
 * Optional overrides E2E tests can inject via `page.addInitScript` before the
 * app loads, so gameplay stays deterministic without touching production
 * behavior (this global is undefined for every real player). Shared by both
 * game modes: `words`/`random` apply to either, `startingPlayer` only means
 * anything for the two-player mode.
 */
interface HangmanTestOverrides {
  words?: string[]
  startingPlayer?: PlayerId
  /** Fixes the "free starting letter" pick; 0 always reveals the word's first letter. */
  random?: number
}

declare global {
  interface Window {
    __HANGMAN_TEST__?: HangmanTestOverrides
  }
}

function getOverrides(): HangmanTestOverrides | undefined {
  return typeof window !== 'undefined' ? window.__HANGMAN_TEST__ : undefined
}

function makeWordPicker(words: string[]): () => string {
  let index = 0
  return () => {
    const word = words[index % words.length]
    index += 1
    if (word === undefined) throw new Error('__HANGMAN_TEST__.words is empty')
    return word
  }
}

export function resolveGameDependencies(defaults: GameDependencies): GameDependencies {
  const overrides = getOverrides()
  if (!overrides) return defaults

  const { words, startingPlayer, random } = overrides
  return {
    pickWord: words ? makeWordPicker(words) : defaults.pickWord,
    pickStartingPlayer: startingPlayer
      ? () => startingPlayer
      : defaults.pickStartingPlayer,
    random: random !== undefined ? () => random : defaults.random,
  }
}

export function resolveSingleplayerDependencies(
  defaults: SingleplayerDependencies,
): SingleplayerDependencies {
  const overrides = getOverrides()
  if (!overrides) return defaults

  const { words, random } = overrides
  return {
    pickWord: words ? makeWordPicker(words) : defaults.pickWord,
    random: random !== undefined ? () => random : defaults.random,
  }
}
