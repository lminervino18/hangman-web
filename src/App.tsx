import { useState } from 'react'
import { GameShell } from './components/GameShell'
import { MainMenu } from './components/screens/MainMenu'
import { MultiplayerGame } from './components/multiplayer/MultiplayerGame'
import { SingleplayerGame } from './components/singleplayer/SingleplayerGame'
import { MuteButton } from './components/ui/MuteButton'
import { isTypingInField, useKeyPress } from './hooks/useKeyPress'
import { useMute } from './hooks/useMute'

type AppMode = 'menu' | 'multiplayer' | 'singleplayer'

function App() {
  const [mode, setMode] = useState<AppMode>('menu')
  const { muted, toggle: toggleMute } = useMute()

  useKeyPress('m', () => {
    if (!isTypingInField()) toggleMute()
  })

  return (
    <GameShell>
      <MuteButton muted={muted} onToggle={toggleMute} />

      {mode === 'menu' && (
        <MainMenu
          onSelectMultiplayer={() => setMode('multiplayer')}
          onSelectSingleplayer={() => setMode('singleplayer')}
        />
      )}

      {mode === 'multiplayer' && <MultiplayerGame onExit={() => setMode('menu')} />}
      {mode === 'singleplayer' && <SingleplayerGame onExit={() => setMode('menu')} />}
    </GameShell>
  )
}

export default App
