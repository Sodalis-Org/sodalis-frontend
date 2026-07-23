import { useEffect } from 'react'

// Définit un <title> distinct par route (RGAA 8.5) — sans dépendance
// supplémentaire type react-helmet, un simple effet sur document.title suffit.
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Sodalis` : 'Sodalis'
  }, [title])
}
