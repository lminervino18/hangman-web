import styles from './OnScreenKeyboard.module.css'

const SPANISH_ALPHABET = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'Ñ',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'Ü',
  'V',
  'W',
  'X',
  'Y',
  'Z',
]

interface OnScreenKeyboardProps {
  revealedLetters: ReadonlySet<string>
  wrongLetters: ReadonlySet<string>
  onLetterClick: (letter: string) => void
}

export function OnScreenKeyboard({
  revealedLetters,
  wrongLetters,
  onLetterClick,
}: OnScreenKeyboardProps) {
  return (
    <div className={styles.keyboard}>
      {SPANISH_ALPHABET.map((letter) => {
        const isRevealed = revealedLetters.has(letter)
        const isWrong = wrongLetters.has(letter)
        const classNames = [styles.key]
        if (isRevealed) classNames.push(styles.correct)
        if (isWrong) classNames.push(styles.wrong)

        return (
          <button
            key={letter}
            type="button"
            className={classNames.join(' ')}
            disabled={isRevealed || isWrong}
            onClick={() => onLetterClick(letter)}
          >
            {letter}
          </button>
        )
      })}
    </div>
  )
}
