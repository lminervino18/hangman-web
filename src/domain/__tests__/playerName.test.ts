import { describe, expect, it } from 'vitest'
import { validatePlayerName } from '../playerName'

describe('validatePlayerName', () => {
  it('accepts a normal name', () => {
    expect(validatePlayerName('Ana')).toBe('Ana')
  })

  it('trims surrounding whitespace', () => {
    expect(validatePlayerName('  Ana  ')).toBe('Ana')
  })

  it('rejects names shorter than 2 characters', () => {
    expect(validatePlayerName('A')).toBeNull()
  })

  it('rejects names longer than 9 characters', () => {
    expect(validatePlayerName('ABCDEFGHIJ')).toBeNull()
  })

  it('accepts a two-word name with a single space', () => {
    expect(validatePlayerName('Ana Lu')).toBe('Ana Lu')
  })

  it('rejects a name with more than one space', () => {
    expect(validatePlayerName('A B C')).toBeNull()
  })

  it('rejects a name made only of whitespace', () => {
    expect(validatePlayerName('   ')).toBeNull()
  })
})
