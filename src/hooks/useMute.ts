import { useCallback, useState } from 'react'
import { setMuted } from '../audio/audioManager'

export function useMute() {
  const [muted, setMutedState] = useState(false)

  const toggle = useCallback(() => {
    setMutedState((current) => {
      const next = !current
      setMuted(next)
      return next
    })
  }, [])

  return { muted, toggle }
}
