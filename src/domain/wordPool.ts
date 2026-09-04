import { WORDS } from '../data/words'

/** Draws a uniformly random raw word from the full dictionary, shared by every mode. */
export function pickRandomWord(): string {
  const index = Math.floor(Math.random() * WORDS.length)
  const word = WORDS[index]
  if (word === undefined) {
    throw new Error('WORDS list is empty')
  }
  return word
}
