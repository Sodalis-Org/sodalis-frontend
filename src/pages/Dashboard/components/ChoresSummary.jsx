import { Link } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { clsx } from 'clsx'

const TILES = [
  { key: 'todo', label: 'À faire', bg: 'bg-card', text: 'text-foreground' },
  { key: 'inProgress', label: 'En cours', bg: 'bg-card', text: 'text-primary' },
  { key: 'done', label: 'Terminées', bg: 'bg-secondary/10', text: 'text-secondary' },
]

export default function ChoresSummary({ counts, openComplaints }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-foreground">Corvées de la maison</h2>
        <Link to="/chores" className="text-sm font-semibold text-primary">Voir tout</Link>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {TILES.map(({ key, label, bg, text }) => (
          <div key={key} className={clsx('rounded-2xl p-3 text-center shadow-sm', bg, text)}>
            <p className="text-2xl font-bold">{counts[key]}</p>
            <p className="text-xs font-medium mt-1 text-muted-foreground uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {openComplaints > 0 && (
        <div className="mt-2 flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent-foreground rounded-2xl p-3.5">
          <MessageSquare size={16} aria-hidden="true" className="shrink-0" />
          <p className="text-sm font-medium">
            {openComplaints} plainte{openComplaints > 1 ? 's' : ''} ouverte{openComplaints > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </section>
  )
}
