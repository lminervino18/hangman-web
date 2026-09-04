import { MAX_PLAYER_NAME_LENGTH, MIN_PLAYER_NAME_LENGTH } from './constants'

/**
 * Validates and normalizes a player name, matching the original game's
 * `name_is_valid`: 2-9 characters, not only whitespace, and at most one
 * internal space. Returns the trimmed name, or null when invalid.
 */
export function validatePlayerName(rawName: string): string | null {
  const trimmed = rawName.trim()

  if (
    trimmed.length < MIN_PLAYER_NAME_LENGTH ||
    trimmed.length > MAX_PLAYER_NAME_LENGTH
  ) {
    return null
  }

  const spaceCount = trimmed.split(' ').length - 1
  if (spaceCount > 1) return null

  return trimmed
}
