import type { PlayerId, PlayerState } from '../../domain/types'
import { Gallows } from './Gallows'
import styles from './PlayerPanel.module.css'

interface PlayerPanelProps {
  playerId: PlayerId
  player: PlayerState
  isActive: boolean
  mirrored?: boolean
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
      <p className={styles.name}>{player.name.toUpperCase()}</p>
      <Gallows lives={player.lives} mirrored={mirrored} />
      <div
        className={styles.icons}
        data-testid="lives"
        aria-label={`${player.lives} lives`}
      >
        {Array.from({ length: player.lives }, (_, i) => (
          <img key={i} className={styles.icon} src="/assets/images/heart.png" alt="" />
        ))}
      </div>
      <div
        className={styles.icons}
        data-testid="points"
        aria-label={`${player.points} points`}
      >
        {Array.from({ length: player.points }, (_, i) => (
          <img key={i} className={styles.icon} src="/assets/images/trophy.png" alt="" />
        ))}
      </div>
    </div>
  )
}
