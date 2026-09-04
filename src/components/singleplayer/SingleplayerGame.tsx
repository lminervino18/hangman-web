import { useEffect } from 'react'
import { useKeyPress } from '../../hooks/useKeyPress'
import { useLeaveConfirmation } from '../../hooks/useLeaveConfirmation'
import { useSingleplayerGame } from '../../hooks/useSingleplayerGame'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { MenuButton } from '../ui/MenuButton'
import { SingleplayerResultScreen } from './SingleplayerResultScreen'
import { SingleplayerRunScreen } from './SingleplayerRunScreen'

export function SingleplayerGame({ onExit }: { onExit: () => void }) {
  const { state, dispatch, startMusic, restart } = useSingleplayerGame()
  const leave = useLeaveConfirmation(state.status !== 'ended', onExit)

  useEffect(() => {
    startMusic()
  }, [startMusic])

  useKeyPress('Escape', () => {
    if (state.status !== 'ended') leave.requestLeave()
  })

  return (
    <>
      {state.status !== 'ended' && <MenuButton onClick={leave.requestLeave} />}

      {state.status === 'ended' ? (
        <SingleplayerResultScreen state={state} onRestart={restart} onExit={onExit} />
      ) : (
        <SingleplayerRunScreen
          state={state}
          onGuessChange={(value) => dispatch({ type: 'GUESS_DRAFT_CHANGED', value })}
          onGuessSubmit={() => dispatch({ type: 'GUESS_SUBMITTED' })}
        />
      )}

      {leave.confirmOpen && (
        <ConfirmDialog
          title="¿Abandonar la racha?"
          message="Se perderá el progreso actual."
          cancelLabel="Seguir jugando"
          confirmLabel="Salir al menú"
          onCancel={leave.cancelLeave}
          onConfirm={leave.confirmLeave}
        />
      )}
    </>
  )
}
