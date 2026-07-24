import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// La cloche de notifications flotte en haut à droite sur toutes les pages. Les
// pages qui ont besoin d'un bouton d'action dans ce même coin (le "+" de
// Corvées, le cœur Karma de Chez nous) ne peuvent pas le positionner
// elles-mêmes sans se superposer à la cloche : elles l'enregistrent ici, et
// AppLayout le rend dans la même rangée fixe, juste à côté d'elle.
const PageActionContext = createContext(null)

export function PageActionProvider({ children }) {
  const [action, setAction] = useState(null)
  const value = useMemo(() => ({ action, setAction }), [action])
  return <PageActionContext.Provider value={value}>{children}</PageActionContext.Provider>
}

export function usePageAction() {
  const ctx = useContext(PageActionContext)
  if (!ctx) throw new Error('usePageAction must be used within a PageActionProvider')
  return ctx.action
}

// Rend le bouton d'action publié par la page courante, s'il y en a un.
// Utilisé par App.jsx (à côté de la cloche) — et par les tests qui montent
// une page isolément, pour retrouver ce bouton dans le DOM.
export function PageActionSlot() {
  return usePageAction()
}

// Appelé par une page pour publier son bouton d'action top-right. Se
// désenregistre automatiquement au démontage ou quand `node` change.
export function useSetPageAction(node) {
  const ctx = useContext(PageActionContext)
  if (!ctx) throw new Error('useSetPageAction must be used within a PageActionProvider')
  const { setAction } = ctx
  useEffect(() => {
    setAction(node)
    return () => setAction(null)
  }, [node, setAction])
}
