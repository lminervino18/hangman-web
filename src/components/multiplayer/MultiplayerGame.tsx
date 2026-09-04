import { useEffect } from 'react'
import { useKeyPress } from '../../hooks/useKeyPress'
import { useLeaveConfirmation } from '../../hooks/useLeaveConfirmation'
import { useGame } from '../../hooks/useGame'
import { BattleScreen } from '../screens/BattleScreen'
import { EndScreen } from '../screens/EndScreen'
import { NameEntryScreen } from '../screens/NameEntryScreen'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { MenuButton } from '../ui/MenuButton'

export function MultiplayerGame({ onExit }: { onExit: () => void }) {
  const { state, dispatch, startMusic } = useGame()
  const leave = useLeaveConfirmation(state.screen === 'battle', onExit)

  useEffect(() => {
    startMusic()
  }, [startMusic])

  useKeyPress('Escape', () => {
    if (state.screen === 'battle') leave.requestLeave()
  })

  const showMenuButton = state.screen === 'nameEntry' || state.screen === 'battle'

  return (
    <>
      {showMenuButton && <MenuButton onClick={leave.requestLeave} />}

      {state.screen === 'nameEntry' && (
        <NameEntryScreen
          target={state.nameEntryTarget}
          draft={state.nameEntryDraft}
          onChange={(value) => dispatch({ type: 'NAME_DRAFT_CHANGED', value })}
          onSubmit={() => dispatch({ type: 'NAME_SUBMITTED' })}
        />
      )}

      {state.screen === 'battle' && (
        <BattleScreen
          state={state}
          onGuessChange={(value) => dispatch({ type: 'GUESS_DRAFT_CHANGED', value })}
          onGuessSubmit={() => dispatch({ type: 'GUESS_SUBMITTED' })}
        />
      )}

      {state.screen === 'end' && (
        <EndScreen
          state={state}
          onRematch={() => dispatch({ type: 'REMATCH' })}
          onExit={onExit}
        />
      )}

      {leave.confirmOpen && (
        <ConfirmDialog
          title="¿Salir de la partida?"
          message="Se perderá el progreso de esta partida."
          cancelLabel="Seguir jugando"
          confirmLabel="Salir al menú"
          onCancel={leave.cancelLeave}
          onConfirm={leave.confirmLeave}
        />
      )}
    </>
  )
}
