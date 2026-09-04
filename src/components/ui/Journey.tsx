import { buildDictionaryUrl } from '../../ui/dictionaryLink'
import styles from './Journey.module.css'

export interface JourneyItem {
  readonly word: string
  /** A CSS color value; each mode picks what it means (success/failure, a player, ...). */
  readonly accentColor: string
  readonly caption?: string
}

interface JourneyProps {
  items: readonly JourneyItem[]
}

export function Journey({ items }: JourneyProps) {
  if (items.length === 0) return null

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>Tu recorrido</h3>
      <div className={styles.chips}>
        {items.map((item, index) => (
          <a
            key={`${item.word}-${index}`}
            className={styles.chip}
            style={{ borderLeftColor: item.accentColor }}
            href={buildDictionaryUrl(item.word)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Buscar definición de ${item.word} en el diccionario`}
          >
            {item.word}
            {item.caption && <span className={styles.caption}>{item.caption}</span>}
          </a>
        ))}
      </div>
    </section>
  )
}
