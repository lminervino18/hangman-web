import { useState } from 'react'

/**
 * Shared "leave with confirmation if something would be lost" flow, used by
 * both game modes' menu buttons: skip the dialog when nothing is at stake,
 * otherwise ask before discarding progress.
 */
export function useLeaveConfirmation(hasActiveProgress: boolean, onLeave: () => void) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  function requestLeave() {
    if (hasActiveProgress) {
      setConfirmOpen(true)
    } else {
      onLeave()
    }
  }

  function confirmLeave() {
    setConfirmOpen(false)
    onLeave()
  }

  function cancelLeave() {
    setConfirmOpen(false)
  }

  return { confirmOpen, requestLeave, confirmLeave, cancelLeave }
}
