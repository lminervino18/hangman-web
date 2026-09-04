import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ensureMusicPlaying, playEventSound, setMusicVolume } from '../audio/audioManager'
import { loadBestStreak, saveBestStreak } from '../domain/singleplayer/bestStreakStorage'
import { ROUND_TRANSITION_MS } from '../domain/singleplayer/constants'
import { defaultSingleplayerDependencies } from '../domain/singleplayer/defaultDependencies'
import { applyRunAction, createInitialRun } from '../domain/singleplayer/engine'
import type {
  SingleplayerDependencies,
  SingleplayerAction,
  SingleplayerState,
} from '../domain/singleplayer/types'
import { resolveSingleplayerDependencies } from '../testHooks'

// `createInitialRun` draws a word through `deps.pickWord`, which the test
// harness backs with a stateful cycling counter. `useState`'s lazy
// initializer isn't safe for that: React (StrictMode, in development) calls
// it twice and discards one result, silently burning a word. Caching by the
// (stable, per-hook-instance) `deps` reference means the second call is a
// cache hit instead of a second draw, no matter how many times React
// invokes the initializer.
const initialRunCache = new WeakMap<SingleplayerDependencies, SingleplayerState>()

function getOrCreateInitialRun(
  deps: SingleplayerDependencies,
  bestStreak: number,
): SingleplayerState {
  const cached = initialRunCache.get(deps)
  if (cached) return cached
  const run = createInitialRun(deps, bestStreak)
  initialRunCache.set(deps, run)
  return run
}

export function useSingleplayerGame() {
  const deps = useMemo(
    () => resolveSingleplayerDependencies(defaultSingleplayerDependencies),
    [],
  )

  const [state, setState] = useState<SingleplayerState>(() =>
    getOrCreateInitialRun(deps, loadBestStreak()),
  )
  const stateRef = useRef(state)

  const dispatch = useCallback(
    (action: SingleplayerAction) => {
      const result = applyRunAction(stateRef.current, action, deps)
      stateRef.current = result.state
      setState(result.state)
      for (const event of result.events) playEventSound(event)
      if (result.events.includes('newRecord')) saveBestStreak(result.state.bestStreak)
    },
    [deps],
  )

  useEffect(() => {
    setMusicVolume(state.musicVolume)
  }, [state.musicVolume])

  useEffect(() => {
    if (state.status !== 'transitioning') return
    const timer = window.setTimeout(
      () => dispatch({ type: 'ADVANCE_ROUND' }),
      ROUND_TRANSITION_MS,
    )
    return () => window.clearTimeout(timer)
  }, [state.status, dispatch])

  const startMusic = useCallback(() => {
    ensureMusicPlaying(stateRef.current.musicVolume)
  }, [])

  const restart = useCallback(() => dispatch({ type: 'RESTART_RUN' }), [dispatch])

  return { state, dispatch, startMusic, restart }
}
