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

export function setMusicVolume(volume: number): void {
  music?.volume(volume)
}

export function setMuted(muted: boolean): void {
  Howler.mute(muted)
}
