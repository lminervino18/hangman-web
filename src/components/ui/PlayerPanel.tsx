import { IMAGES } from '../../ui/images'
import type { PlayerId, PlayerState } from '../../domain/types'
import { Gallows } from './Gallows'
import styles from './PlayerPanel.module.css'

interface PlayerPanelProps {
  playerId: PlayerId
  player: PlayerState
  isActive: boolean
  mirrored?: boolean
}

function IconRow({ count, src, label }: { count: number; src: string; label: string }) {
  return (
    <div className={styles.icons} aria-label={label}>
      {Array.from({ length: count }, (_, index) => (
        <img key={index} className={styles.icon} src={src} alt="" />
      ))}
    </div>
  )
}

export function PlayerPanel({
  playerId,
  player,
  isActive,
  mirrored = false,
}: PlayerPanelProps) {
  return (
    <div
      className={isActive ? `${styles.panel} ${styles.active}` : styles.panel}
      data-testid={`player-panel-${playerId}`}
    >
      <p className={styles.name}>{player.name}</p>
      <Gallows lives={player.lives} mirrored={mirrored} />
      <IconRow count={player.lives} src={IMAGES.heart} label={`${player.lives} vidas`} />
      <IconRow
        count={player.points}
        src={IMAGES.trophy}
        label={`${player.points} puntos`}
      />
    </div>
  )
}
