import { useKeyPress } from '../../hooks/useKeyPress'
import { IMAGES } from '../../ui/images'
import { Button } from '../ui/Button'
import styles from './IntroScreen.module.css'

export function IntroScreen({ onStart }: { onStart: () => void }) {
  useKeyPress('Enter', onStart)

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>The Hangman Game</h1>
      <img className={styles.person} src={IMAGES.introPerson} alt="" />
      <p className={styles.prompt}>Presioná Enter para comenzar</p>
      <Button onClick={onStart}>Comenzar</Button>
    </div>
  )
}
