import { useEffect, useRef } from 'react'
import { playKeyPressSound } from '../../audio/audioManager'
import { MAX_PLAYER_NAME_LENGTH } from '../../domain/constants'
import { validatePlayerName } from '../../domain/playerName'
import type { PlayerId } from '../../domain/types'
import { Button } from '../ui/Button'
import styles from './NameEntryScreen.module.css'

const PLAYER_LABELS: Record<PlayerId, string> = {
  player1: 'Jugador 1',
  player2: 'Jugador 2',
}

interface NameEntryScreenProps {
  target: PlayerId
  draft: string
  onChange: (value: string) => void
  onSubmit: () => void
}

export function NameEntryScreen({
  target,
  draft,
  onChange,
  onSubmit,
}: NameEntryScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [target])

  const isValid = validatePlayerName(draft) !== null

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!isValid) return
    playKeyPressSound()
    onSubmit()
  }

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Ingresá tu nombre ({PLAYER_LABELS[target]})</h2>
      <input
        ref={inputRef}
        className={styles.input}
        value={draft}
        maxLength={MAX_PLAYER_NAME_LENGTH}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={() => playKeyPressSound()}
        aria-label={`Nombre del ${PLAYER_LABELS[target].toLowerCase()}`}
        autoComplete="off"
      />
      <p className={styles.hint}>Entre 2 y 9 caracteres</p>
      <Button type="submit" disabled={!isValid}>
        Continuar
      </Button>
    </form>
  )
}
