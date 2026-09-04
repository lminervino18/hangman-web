import { GameShell } from './components/GameShell'
import { BattleScreen } from './components/screens/BattleScreen'
import { EndScreen } from './components/screens/EndScreen'
import { IntroScreen } from './components/screens/IntroScreen'
import { NameEntryScreen } from './components/screens/NameEntryScreen'
import { MuteButton } from './components/ui/MuteButton'
import { useGame } from './hooks/useGame'

function App() {
  const { state, dispatch, startMusic } = useGame()

  function handleStart() {
    startMusic()
    dispatch({ type: 'START_GAME' })
  }

  return (
    <GameShell>
      <MuteButton />

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
        <EndScreen
          state={state}
          onRestart={() => dispatch({ type: 'MATCH_RESTARTED' })}
        />
      )}
    </GameShell>
  )
}

export default App
