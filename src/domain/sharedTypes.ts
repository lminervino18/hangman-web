export interface LetterCell {
  readonly letter: string
  readonly revealed: boolean
}

export interface RoundState {
  readonly word: string
  readonly cells: readonly LetterCell[]
  readonly wrongEntries: readonly string[]
}
