import { Howl, Howler } from 'howler'
import type { GameEvent } from '../domain/types'
import type { SingleplayerEvent } from '../domain/singleplayer/types'

export type SoundEvent = GameEvent | SingleplayerEvent

const ASSET_BASE = '/assets/audio'

const effectSources: Record<SoundEvent | 'keyPress', string> = {
  roundPoint: `${ASSET_BASE}/point.mp3`,
  wrongLetter: `${ASSET_BASE}/wrong-letter.mp3`,
  wordComplete: `${ASSET_BASE}/word-complete.mp3`,
  wrongWordAttempt: `${ASSET_BASE}/wrong-word-attempt.mp3`,
  nextRound: `${ASSET_BASE}/next-round.mp3`,
  matchWon: `${ASSET_BASE}/victory.mp3`,
  milestone: `${ASSET_BASE}/victory.mp3`,
  newRecord: `${ASSET_BASE}/victory.mp3`,
  runEnded: `${ASSET_BASE}/wrong-word-attempt.mp3`,
  keyPress: `${ASSET_BASE}/key-press.mp3`,
}

let effects: Record<string, Howl> | null = null
let music: Howl | null = null

/** Long enough to feel smooth, short enough not to lag behind rapid guesses. */
const MUSIC_FADE_MS = 900

function getEffects(): Record<string, Howl> {
  effects ??= Object.fromEntries(
    Object.entries(effectSources).map(([key, src]) => [key, new Howl({ src: [src] })]),
  )
  return effects
}

export function playEventSound(event: SoundEvent): void {
  getEffects()[event]?.play()
}

export function playKeyPressSound(): void {
  getEffects().keyPress?.play()
}

/** Starts the looping theme music. Safe to call multiple times. */
export function ensureMusicPlaying(initialVolume: number): void {
  music ??= new Howl({
    src: [`${ASSET_BASE}/theme-song.mp3`],
    loop: true,
    volume: initialVolume,
  })
  if (!music.playing()) music.play()
}

/** Eases toward the target volume instead of jumping, so tension changes
 * (a round won, a fresh rematch, leaving to the main menu) are never heard
 * as an abrupt cut. */
export function setMusicVolume(volume: number): void {
  if (!music) return
  const current = music.volume()
  if (current === volume) return
  music.fade(current, volume, MUSIC_FADE_MS)
}

export function setMuted(muted: boolean): void {
  Howler.mute(muted)
}
