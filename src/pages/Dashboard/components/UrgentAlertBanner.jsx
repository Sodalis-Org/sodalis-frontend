import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { clsx } from 'clsx'

const PRIORITY_STYLES = {
  URGENT: { bar: 'border-destructive/50', bg: 'bg-destructive/5', iconBg: 'bg-destructive/10', text: 'text-destructive', cta: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' },
  HIGH: { bar: 'border-primary/50', bg: 'bg-primary/5', iconBg: 'bg-primary/10', text: 'text-primary', cta: 'bg-primary text-primary-foreground hover:bg-primary/90' },
}

const PRIORITY_LABELS = { URGENT: 'Urgent', HIGH: 'Élevé' }

export default function UrgentAlertBanner({ ticket, isSelfAssigned, extraCount }) {
  const style = PRIORITY_STYLES[ticket.priority] ?? PRIORITY_STYLES.HIGH

  return (
    <div>
      <div className={clsx('flex gap-3 p-4 rounded-2xl border-l-4 shadow-sm', style.bar, style.bg)}>
        <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center shrink-0', style.iconBg, style.text)}>
          <AlertTriangle size={18} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">
            {ticket.title} <span className={clsx('font-normal text-sm', style.text)}>({PRIORITY_LABELS[ticket.priority] ?? ticket.priority})</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isSelfAssigned
              ? "Tu as été assigné(e) automatiquement suite à la création du ticket."
              : 'Un ticket de maintenance prioritaire nécessite une action.'}
          </p>
          <Link
            to="/chores"
            className={clsx('inline-block mt-3 px-4 py-2 rounded-xl text-sm font-semibold transition', style.cta)}
          >
            Voir le ticket
          </Link>
        </div>
      </div>
      {extraCount > 0 && (
        <Link to="/chores" className="block mt-2 text-xs font-medium text-muted-foreground hover:text-foreground text-center">
          + {extraCount} autre{extraCount > 1 ? 's' : ''} alerte{extraCount > 1 ? 's' : ''}
        </Link>
      )}
    </div>
  )
}
