import { clsx } from 'clsx'
import { BUCKETS } from '../constants'

// Only TODO/IN_PROGRESS carry a count badge — DONE is a large, less actionable
// bucket and stays quiet, matching the maquette.
export default function StatusFilterPills({ active, onChange, counts }) {
  return (
    <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Filtrer par statut">
      {BUCKETS.map(({ value, label }) => {
        const isActive = active === value
        const count = counts[value]
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            className={clsx(
              'shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-primary/25 text-primary hover:bg-primary/5',
            )}
          >
            {label}
            {value !== 'DONE' && ` (${count})`}
          </button>
        )
      })}
    </div>
  )
}
