import { loadBestStreak } from '../../domain/singleplayer/bestStreakStorage'
import { IMAGES } from '../../ui/images'
import styles from './MainMenu.module.css'

interface MainMenuProps {
  onSelectMultiplayer: () => void
  onSelectSingleplayer: () => void
}

export function MainMenu({ onSelectMultiplayer, onSelectSingleplayer }: MainMenuProps) {
  const bestStreak = loadBestStreak()

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>The Hangman Game</h1>
      <img className={styles.person} src={IMAGES.introPerson} alt="" />

      <div className={styles.modes}>
        <button type="button" className={styles.modeCard} onClick={onSelectMultiplayer}>
          <span className={styles.modeName}>Dos jugadores</span>
          <p className={styles.modeHint}>Batalla local por turnos, a 3 puntos.</p>
        </button>

        <button type="button" className={styles.modeCard} onClick={onSelectSingleplayer}>
          <span className={styles.modeName}>Un jugador</span>
          <p className={styles.modeHint}>¿Cuántas palabras seguidas podés adivinar?</p>
        </button>
      </div>

      {bestStreak > 0 && <p className={styles.bestStreak}>Mejor racha: {bestStreak}</p>}
    </div>
  )
}
