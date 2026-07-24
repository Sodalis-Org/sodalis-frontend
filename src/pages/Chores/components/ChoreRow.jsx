import { CheckCircle2, Circle, Clock, ChevronRight, User } from 'lucide-react'
import { clsx } from 'clsx'
import Avatar from '../../../components/Avatar'
import { categoryMeta, priorityMeta } from '../constants'
import { formatDate, isItemOverdue } from '../helpers'

function StatusCircle({ item, onAdvance }) {
  const isDone = item.bucket === 'DONE'
  const isInProgress = item.bucket === 'IN_PROGRESS'
  const overdue = isItemOverdue(item)

  return (
    <button
      type="button"
      onClick={() => !isDone && onAdvance(item)}
      disabled={isDone}
      aria-label={isDone ? 'Terminée' : isInProgress ? 'Marquer comme terminée' : 'Démarrer'}
      className={clsx(
        'mt-0.5 shrink-0 transition',
        isDone ? 'text-secondary cursor-default' : overdue ? 'text-destructive hover:text-destructive/80' : 'text-muted-foreground/50 hover:text-primary',
      )}
    >
      {isDone || isInProgress ? <CheckCircle2 size={22} aria-hidden="true" /> : <Circle size={22} aria-hidden="true" />}
    </button>
  )
}

export default function ChoreRow({ item, members, currentUserId, onAdvance, onOpen }) {
  const assignee = members.find((m) => m.id === item.assigneeId)
  const isAssignedToMe = item.assigneeId === currentUserId
  const isDone = item.bucket === 'DONE'
  const overdue = isItemOverdue(item)
  const cat = item.kind === 'ticket' ? categoryMeta(item.category) : null
  const priority = item.kind === 'ticket' ? priorityMeta(item.priority) : null

  return (
    <div className="bg-card rounded-2xl border border-border px-4 py-3.5 flex items-start gap-3">
      <StatusCircle item={item} onAdvance={onAdvance} />

      <button type="button" onClick={() => onOpen(item)} className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={clsx('text-sm font-bold leading-snug', isDone ? 'line-through text-muted-foreground' : 'text-foreground')}>
            {item.title}
          </span>
          {overdue && !isDone && (
            <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase bg-destructive/10 text-destructive">Retard</span>
          )}
          {cat && (
            <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase bg-muted text-muted-foreground">{cat.label}</span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {assignee ? <Avatar name={assignee.name} size="xs" /> : <User size={12} aria-hidden="true" />}
            <span className={isAssignedToMe ? 'text-primary font-semibold' : ''}>
              {isAssignedToMe ? 'Toi' : (assignee?.name ?? 'Non assigné')}
            </span>
          </span>

          {item.kind === 'task' && item.dueAt && (
            <span className={clsx('flex items-center gap-1', overdue && !isDone ? 'text-destructive font-semibold' : 'text-muted-foreground')}>
              <Clock size={11} aria-hidden="true" />
              {formatDate(item.dueAt)}
            </span>
          )}

          {item.kind === 'ticket' && priority && (
            <span className="flex items-center gap-1 text-primary font-semibold">
              <span aria-hidden="true">·</span> Priorité : {priority.label}
            </span>
          )}
        </div>
      </button>

      <button type="button" onClick={() => onOpen(item)} aria-label={`Détails — ${item.title}`} className="shrink-0 text-muted-foreground/60 mt-0.5">
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </div>
  )
}
