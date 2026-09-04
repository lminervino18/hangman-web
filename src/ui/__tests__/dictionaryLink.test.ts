import { describe, expect, it } from 'vitest'
import { buildDictionaryUrl } from '../dictionaryLink'

describe('buildDictionaryUrl', () => {
  it('lowercases the word', () => {
    expect(buildDictionaryUrl('CASA')).toBe('https://dle.rae.es/casa')
  })

  it('encodes Ñ correctly', () => {
    expect(buildDictionaryUrl('NIÑO')).toBe('https://dle.rae.es/ni%C3%B1o')
  })

  it('encodes accented vowels correctly', () => {
    expect(buildDictionaryUrl('ÁRBOL')).toBe('https://dle.rae.es/%C3%A1rbol')
  })
})
