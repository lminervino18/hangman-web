import { buildDictionaryUrl } from '../../ui/dictionaryLink'
import styles from './LastWordLink.module.css'

interface LastWordLinkProps {
  word: string
  testId?: string
}

export function LastWordLink({ word, testId }: LastWordLinkProps) {
  if (!word) {
    return (
      <p className={styles.text} data-testid={testId}>
        &nbsp;
      </p>
    )
  }

  return (
    <p className={styles.text} data-testid={testId}>
      Última palabra:{' '}
      <a
        className={styles.link}
        href={buildDictionaryUrl(word)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Buscar definición de ${word} en el diccionario`}
      >
        {word}
        <span className={styles.icon} aria-hidden="true">
          ↗
        </span>
      </a>
    </p>
  )
}
