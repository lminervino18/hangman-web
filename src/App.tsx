import { useState } from 'react'
import { GameShell } from './components/GameShell'
import { BattleScreen } from './components/screens/BattleScreen'
import { EndScreen } from './components/screens/EndScreen'
import { IntroScreen } from './components/screens/IntroScreen'
import { NameEntryScreen } from './components/screens/NameEntryScreen'
import { ConfirmDialog } from './components/ui/ConfirmDialog'
import { MenuButton } from './components/ui/MenuButton'
import { MuteButton } from './components/ui/MuteButton'
import { useGame } from './hooks/useGame'

function App() {
  const { state, dispatch, startMusic } = useGame()
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false)

  function handleStart() {
    startMusic()
    dispatch({ type: 'START_GAME' })
  }

  function handleMenuRequest() {
    if (state.screen === 'battle') {
      setLeaveConfirmOpen(true)
    } else {
      dispatch({ type: 'RETURN_TO_MENU' })
    }
  }

  function confirmLeaveGame() {
    setLeaveConfirmOpen(false)
    dispatch({ type: 'RETURN_TO_MENU' })
  }

  const showMenuButton = state.screen === 'nameEntry' || state.screen === 'battle'

  return (
    <GameShell>
      <MuteButton />
      {showMenuButton && <MenuButton onClick={handleMenuRequest} />}

      {state.screen === 'intro' && <IntroScreen onStart={handleStart} />}

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
        <EndScreen state={state} onRestart={() => dispatch({ type: 'RETURN_TO_MENU' })} />
      )}

      {leaveConfirmOpen && (
        <ConfirmDialog
          title="¿Salir de la partida?"
          message="Se perderá el progreso de esta partida."
          cancelLabel="Seguir jugando"
          confirmLabel="Salir al menú"
          onCancel={() => setLeaveConfirmOpen(false)}
          onConfirm={confirmLeaveGame}
        />
      )}
    </GameShell>
  )
}

export default App
