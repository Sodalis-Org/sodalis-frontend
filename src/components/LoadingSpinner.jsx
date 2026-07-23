import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

// Remplace un <Loader2 className="animate-spin" /> isolé : sans lui, un
// bouton qui bascule vers l'icône de chargement perd tout contenu textuel
// pendant l'attente (aucun nom accessible). role="status"/aria-live annonce
// l'état, l'icône passe en aria-hidden, un texte masqué porte le libellé.
export default function LoadingSpinner({ size = 16, label = 'Chargement en cours', className }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center">
      <Loader2 size={size} aria-hidden="true" className={clsx('animate-spin', className)} />
      <span className="sr-only">{label}</span>
    </span>
  )
}
