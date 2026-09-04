import { describe, expect, it } from 'vitest'
import { normalizeWord } from '../normalize'

describe('normalizeWord', () => {
  it('uppercases plain words', () => {
    expect(normalizeWord('abad')).toBe('ABAD')
  })

  it('strips accents from vowels', () => {
    expect(normalizeWord('aarónico')).toBe('AARONICO')
  })

  it('preserves Ñ, which is not an accented vowel', () => {
    expect(normalizeWord('añadidura')).toBe('AÑADIDURA')
  })

  it('preserves Ü, matching the original game behavior', () => {
    expect(normalizeWord('pingüino')).toBe('PINGÜINO')
  })

  it('handles every accented vowel', () => {
    expect(normalizeWord('áéíóú')).toBe('AEIOU')
  })
})
