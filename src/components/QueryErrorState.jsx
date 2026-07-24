import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function QueryErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-3 px-6 text-center">
      <AlertTriangle size={32} aria-hidden="true" className="text-destructive/70" />
      <p className="text-muted-foreground text-sm">Impossible de charger les données.</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-primary text-sm font-medium flex items-center gap-1"
        >
          <RefreshCw size={14} aria-hidden="true" /> Réessayer
        </button>
      )}
    </div>
  )
}
