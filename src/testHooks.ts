import type { GameDependencies, PlayerId } from './domain/types'

/**
 * Optional overrides E2E tests can inject via `page.addInitScript` before the
 * app loads, so gameplay stays deterministic without touching production
 * behavior (this global is undefined for every real player).
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

export function resolveGameDependencies(defaults: GameDependencies): GameDependencies {
  const overrides = typeof window !== 'undefined' ? window.__HANGMAN_TEST__ : undefined
  if (!overrides) return defaults

  let wordIndex = 0
  const words = overrides.words

  return {
    pickWord: words
      ? () => {
          const word = words[wordIndex % words.length]
          wordIndex += 1
          if (word === undefined) throw new Error('__HANGMAN_TEST__.words is empty')
          return word
        }
      : defaults.pickWord,
    pickStartingPlayer: overrides.startingPlayer
      ? () => overrides.startingPlayer!
      : defaults.pickStartingPlayer,
    random: overrides.random !== undefined ? () => overrides.random! : defaults.random,
  }
}
