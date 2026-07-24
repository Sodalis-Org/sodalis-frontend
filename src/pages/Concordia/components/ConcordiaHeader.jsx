import { useMemo } from 'react'
import { Heart } from 'lucide-react'
import { useSetPageAction } from '../../../context/PageActionContext'

export default function ConcordiaHeader({ onOpenKarma }) {
  const karmaButton = useMemo(() => (
    <button
      onClick={onOpenKarma}
      aria-label="Voir le karma de la coloc et remercier un colocataire"
      className="w-9 h-9 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center hover:bg-accent/30 transition shrink-0"
    >
      <Heart size={17} aria-hidden="true" />
    </button>
  ), [onOpenKarma])
  useSetPageAction(karmaButton)

  return (
    <div className="bg-background border-b border-border px-4 pt-10 pb-4">
      <h1 className="text-xl font-bold text-foreground pr-24">Chez nous</h1>
      <p className="text-xs font-medium text-muted-foreground tracking-wide mt-0.5">FIL DE LA COLOCATION</p>
    </div>
  )
}
