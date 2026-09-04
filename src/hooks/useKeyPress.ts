import { useEffect } from 'react'

export function useKeyPress(key: string, onPress: () => void) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === key) onPress()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, onPress])
}

/** True while focus sits in a text field, where a printable-key shortcut like "M" would otherwise type instead of act. */
export function isTypingInField(): boolean {
  const tag = document.activeElement?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA'
}
