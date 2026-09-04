import { BEST_STREAK_STORAGE_KEY } from './constants'

/** Storage is best-effort: a private/blocked browser must never break the game. */
export function loadBestStreak(): number {
  try {
    const raw = localStorage.getItem(BEST_STREAK_STORAGE_KEY)
    const parsed = raw === null ? 0 : Number(raw)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
  } catch {
    return 0
  }
}

export function saveBestStreak(value: number): void {
  try {
    localStorage.setItem(BEST_STREAK_STORAGE_KEY, String(value))
  } catch {
    // Storage unavailable (private mode, quota, disabled) - non-critical, ignore.
  }
}
