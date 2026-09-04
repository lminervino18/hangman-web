import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ensureMusicPlaying, playEventSound, setMusicVolume } from '../audio/audioManager'
import { defaultGameDependencies } from '../domain/defaultDependencies'
import { applyAction, createInitialState } from '../domain/gameEngine'
import type { GameAction, GameState } from '../domain/types'
import { resolveGameDependencies } from '../testHooks'

export function useGame() {
  const deps = useMemo(() => resolveGameDependencies(defaultGameDependencies), [])
  const [state, setState] = useState<GameState>(() => createInitialState(deps))
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const dispatch = useCallback(
    (action: GameAction) => {
      const result = applyAction(stateRef.current, action, deps)
      stateRef.current = result.state
      setState(result.state)
      for (const event of result.events) playEventSound(event)
    },
    [deps],
  )

  useEffect(() => {
    setMusicVolume(state.musicVolume)
  }, [state.musicVolume])

  const startMusic = useCallback(() => {
    ensureMusicPlaying(stateRef.current.musicVolume)
  }, [])

  return { state, dispatch, startMusic }
}
