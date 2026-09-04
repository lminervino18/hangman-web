const ACCENTED_VOWELS: Record<string, string> = {
  Á: 'A',
  É: 'E',
  Í: 'I',
  Ó: 'O',
  Ú: 'U',
}

/**
 * Uppercases a word and strips accents from vowels only, matching the
 * original game's `replace_accents`. Ñ and Ü are intentionally preserved,
 * since the original never normalized them either.
 */
export function normalizeWord(word: string): string {
  return word
    .toUpperCase()
    .split('')
    .map((letter) => ACCENTED_VOWELS[letter] ?? letter)
    .join('')
}

const LETTER_PATTERN = /^\p{L}$/u

export function isSingleLetter(value: string): boolean {
  return value.length === 1 && LETTER_PATTERN.test(value)
}
