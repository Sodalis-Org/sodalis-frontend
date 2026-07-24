import { HelpCircle } from 'lucide-react'
import Avatar from '../../../components/Avatar'
import { categoryMeta } from '../constants'

export default function UrgentTicketCard({ ticket, members, currentUserId, onOpen }) {
  const cat = categoryMeta(ticket.category)
  const CatIcon = cat?.Icon ?? HelpCircle
  const assignee = members.find((m) => m.id === ticket.assigneeId)
  const isAssignedToMe = ticket.assigneeId === currentUserId

  return (
    <div className="bg-card rounded-3xl border border-accent/40 p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <CatIcon size={20} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-snug">{ticket.title}</p>
          {ticket.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ticket.description}</p>
          )}
        </div>
        <span className="shrink-0 px-2 py-0.5 rounded-lg text-xs font-bold uppercase bg-accent/20 text-accent-foreground">
          Urgent
        </span>
      </div>

      <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
        {assignee && <Avatar name={assignee.name} size="xs" />}
        {isAssignedToMe ? 'Assigné à toi' : assignee ? `Assigné à ${assignee.name}` : 'Non assigné'}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onOpen(ticket)}
          className="flex-1 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-bold hover:bg-accent/90 transition"
        >
          Gérer
        </button>
        <button
          type="button"
          onClick={() => onOpen(ticket)}
          className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/70 transition"
        >
          Détails
        </button>
      </div>
    </div>
  )
}
