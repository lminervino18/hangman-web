import type { Page } from '@playwright/test'

interface TestOverrides {
  words: string[]
  startingPlayer?: 'player1' | 'player2'
  random?: number
}

/** Injects deterministic word/turn/reveal choices before the app boots. */
export async function setupDeterministicGame(page: Page, overrides: TestOverrides) {
  await page.addInitScript((data) => {
    ;(window as unknown as { __HANGMAN_TEST__: unknown }).__HANGMAN_TEST__ = data
  }, overrides)
}

export async function goToIntro(page: Page) {
  await page.goto('/')
}

export async function startMatch(page: Page, name1 = 'Ana', name2 = 'Beto') {
  await page.getByRole('button', { name: 'Dos jugadores' }).click()
  await page.getByRole('textbox').fill(name1)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('textbox').fill(name2)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByTestId('masked-word').waitFor()
}

export async function guessLetter(page: Page, letter: string) {
  await page.getByRole('button', { name: letter, exact: true }).click()
  await page.getByRole('button', { name: 'Adivinar' }).click()
}

export async function guessWord(page: Page, word: string) {
  await page.getByRole('textbox').fill(word)
  await page.getByRole('button', { name: 'Adivinar' }).click()
}

/** Filler letters guaranteed not to collide with the short test words below. */
export const FILLER_LETTERS = ['C', 'D', 'E', 'F', 'H', 'I', 'J', 'K', 'L']
