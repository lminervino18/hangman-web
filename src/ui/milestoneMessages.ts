const MILESTONE_MESSAGES: Record<number, string> = {
  5: '¡Racha de 5!',
  10: '¡10 palabras seguidas!',
  20: '¡20! Esto ya es serio.',
  30: '¡30 seguidas! Impresionante.',
  50: '¡50! Sos una máquina.',
}

export function milestoneMessage(streak: number): string {
  return MILESTONE_MESSAGES[streak] ?? `¡Racha de ${streak}!`
}
