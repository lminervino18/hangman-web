import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BEST_STREAK_STORAGE_KEY } from '../constants'
import { loadBestStreak, saveBestStreak } from '../bestStreakStorage'

describe('best streak storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to 0 when nothing is stored', () => {
    expect(loadBestStreak()).toBe(0)
  })

  it('round-trips a saved value', () => {
    saveBestStreak(17)
    expect(loadBestStreak()).toBe(17)
  })

  it('falls back to 0 for corrupted storage content', () => {
    localStorage.setItem(BEST_STREAK_STORAGE_KEY, 'not-a-number')
    expect(loadBestStreak()).toBe(0)
  })

  it('falls back to 0 for a negative stored value', () => {
    localStorage.setItem(BEST_STREAK_STORAGE_KEY, '-5')
    expect(loadBestStreak()).toBe(0)
  })

  describe('when localStorage throws', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('loadBestStreak never throws and returns 0', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage blocked')
      })
      expect(() => loadBestStreak()).not.toThrow()
      expect(loadBestStreak()).toBe(0)
    })

    it('saveBestStreak never throws', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('storage blocked')
      })
      expect(() => saveBestStreak(5)).not.toThrow()
    })
  })
})
