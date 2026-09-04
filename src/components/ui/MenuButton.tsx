import styles from './MenuButton.module.css'

export function MenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onClick}
      title="Esc · Menú principal"
    >
      Menú principal
    </button>
  )
}
