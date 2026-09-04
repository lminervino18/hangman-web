import { useCallback, useState } from 'react'
import { setMusicVolume } from './audio/audioManager'
import { GameShell } from './components/GameShell'
import { MainMenu } from './components/screens/MainMenu'
import { MultiplayerGame } from './components/multiplayer/MultiplayerGame'
import { SingleplayerGame } from './components/singleplayer/SingleplayerGame'
import { MuteButton } from './components/ui/MuteButton'
import { INITIAL_MUSIC_VOLUME } from './domain/constants'
import { isTypingInField, useKeyPress } from './hooks/useKeyPress'
import { useMute } from './hooks/useMute'

type AppMode = 'menu' | 'multiplayer' | 'singleplayer'

function App() {
  const [mode, setMode] = useState<AppMode>('menu')
  const { muted, toggle: toggleMute } = useMute()

  useKeyPress('m', () => {
    if (!isTypingInField()) toggleMute()
  })

  const returnToMenu = useCallback(() => {
    // The music may have ramped up during the match/run just left behind;
    // ease it back to its resting volume instead of leaving it blaring.
    setMusicVolume(INITIAL_MUSIC_VOLUME)
    setMode('menu')
  }, [])

  return (
    <GameShell>
      <MuteButton muted={muted} onToggle={toggleMute} />

      {mode === 'menu' && (
        <MainMenu
          onSelectMultiplayer={() => setMode('multiplayer')}
          onSelectSingleplayer={() => setMode('singleplayer')}
        />
      )}

      {mode === 'multiplayer' && <MultiplayerGame onExit={returnToMenu} />}
      {mode === 'singleplayer' && <SingleplayerGame onExit={returnToMenu} />}
    </GameShell>
  )
}

export default App
