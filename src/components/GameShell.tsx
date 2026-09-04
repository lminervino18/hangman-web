import type { ReactNode } from 'react'
import styles from './GameShell.module.css'

export function GameShell({ children }: { children: ReactNode }) {
  return <div className={styles.shell}>{children}</div>
}
