import styles from './MuteButton.module.css'

interface MuteButtonProps {
  muted: boolean
  onToggle: () => void
}

export function MuteButton({ muted, onToggle }: MuteButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onToggle}
      aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
      aria-pressed={muted}
      title="M · Silenciar"
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
