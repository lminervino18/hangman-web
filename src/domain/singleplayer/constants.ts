/** Streak values that get brief, distinct feedback instead of the usual one. */
export const STREAK_MILESTONES: readonly number[] = [5, 10, 20, 30, 50]

/** How long a completed/failed word stays on screen before the run advances. */
export const ROUND_TRANSITION_MS = 1800

export const BEST_STREAK_STORAGE_KEY = 'hangman:best-streak'
