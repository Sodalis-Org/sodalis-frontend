import { clsx } from 'clsx'
import { AlertTriangle, Target, Trash2, CheckCircle, User } from 'lucide-react'
import Avatar from '../../../components/Avatar'
import { timeAgo } from '../../../lib/time'

export default function ComplaintFeedItem({ complaint, members, currentUserId, isAdmin, onResolve, onDelete }) {
  const creator = members.find((m) => m.id === complaint.creator_id)
  const target  = members.find((m) => m.id === complaint.target_id)
  const isResolved = complaint.status === 'RESOLVED'
  const canAct = isAdmin || complaint.creator_id === currentUserId

  return (
    <div className={clsx(
      'bg-card rounded-2xl border-l-4 border border-border p-4 flex flex-col gap-3',
      isResolved ? 'border-l-secondary/50 opacity-70' : 'border-l-primary/60',
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {complaint.is_anonymous ? (
            <>
              <AlertTriangle size={14} aria-hidden="true" className={isResolved ? 'text-muted-foreground' : 'text-primary'} />
              <span className={clsx('text-sm font-semibold', isResolved ? 'text-muted-foreground' : 'text-primary')}>Signalement Anonyme</span>
            </>
          ) : creator ? (
            <>
              <Avatar name={creator.name} size="xs" />
              <span className="text-sm font-semibold text-foreground">{creator.name}</span>
            </>
          ) : (
            <>
              <User size={14} aria-hidden="true" className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Utilisateur supprimé</span>
            </>
          )}
          {target && (
            <>
              <span className="text-muted-foreground/60 text-xs">→</span>
              <Target size={12} aria-hidden="true" className="text-primary/70" />
              <span className="text-xs font-medium text-primary">{target.name}</span>
            </>
          )}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{timeAgo(complaint.createdAt)}</span>
      </div>

      <p className="text-sm text-foreground italic leading-relaxed">&laquo;&nbsp;{complaint.message}&nbsp;&raquo;</p>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className={clsx(
          'text-xs font-semibold tracking-wide',
          isResolved ? 'text-secondary' : 'text-primary',
        )}>
          {isResolved ? 'RÉSOLUE' : 'EN ATTENTE'}
        </span>
        {canAct && (
          <div className="flex items-center gap-2">
            {!isResolved && (
              <button
                onClick={() => onResolve(complaint.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold hover:bg-secondary/20 transition"
              >
                <CheckCircle size={13} aria-hidden="true" /> Marquer comme résolu (+5 Karma)
              </button>
            )}
            <button
              onClick={() => onDelete(complaint.id)}
              aria-label="Supprimer le signalement"
              className="flex items-center gap-1 p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
            >
              <Trash2 size={13} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
