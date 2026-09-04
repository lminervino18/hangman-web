import { useEffect } from 'react'
import styles from './IntroScreen.module.css'

export function IntroScreen({ onStart }: { onStart: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter') onStart()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onStart])

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>WELCOME TO: HANGMAN GAME</h1>
      <img className={styles.person} src="/assets/images/intro-person.png" alt="" />
      <p className={styles.prompt}>PRESS ENTER TO START</p>
      <button type="button" className={styles.button} onClick={onStart}>
        Start
      </button>
    </div>
  )
}
