import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Piège le focus clavier à l'intérieur du conteneur retourné tant que `active`
// est vrai : place le focus initial dedans, boucle Tab/Shift+Tab sur ses
// bornes, ferme sur Échap et restaure le focus sur l'élément déclencheur à la
// fermeture (RGAA 12.7). Utilisé par Modal et NotificationDrawer.
export function useFocusTrap({ active, onClose }) {
  const containerRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!active) return

    triggerRef.current = document.activeElement

    const container = containerRef.current
    const focusables = container ? Array.from(container.querySelectorAll(FOCUSABLE)) : []
    ;(focusables[0] ?? container)?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose?.()
        return
      }
      if (e.key !== 'Tab' || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      triggerRef.current?.focus?.()
    }
  }, [active, onClose])

  return containerRef
}
