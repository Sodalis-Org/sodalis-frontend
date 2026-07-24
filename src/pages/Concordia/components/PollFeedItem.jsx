import { clsx } from 'clsx'
import { Lock, Check } from 'lucide-react'
import Avatar from '../../../components/Avatar'
import { timeAgo } from '../../../lib/time'

export default function PollFeedItem({ poll, members, currentUserId, isAdmin, onVote, onClose }) {
  const creator     = members.find((m) => m.id === poll.creator_id)
  const totalVotes  = poll.options.reduce((sum, o) => sum + o.voters.length, 0)
  const isClosed    = poll.status === 'CLOSED'
  const winnerCount = Math.max(...poll.options.map((o) => o.voters.length))
  const canClose    = !isClosed && (isAdmin || poll.creator_id === currentUserId)

  return (
    <div className="bg-card rounded-2xl border border-border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {creator && <Avatar name={creator.name} size="xs" />}
          <span className="text-sm font-semibold text-foreground truncate">{creator?.name ?? 'Un colocataire'}</span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{timeAgo(poll.createdAt)}</span>
      </div>

      <p className="text-sm font-semibold text-foreground leading-snug">{poll.question}</p>

      <div className="flex flex-col gap-2">
        {poll.options.map((option) => {
          const pct      = totalVotes > 0 ? Math.round((option.voters.length / totalVotes) * 100) : 0
          const isMyVote = option.voters.includes(currentUserId)
          const isWinner = isClosed && option.voters.length === winnerCount && winnerCount > 0

          return (
            <button
              key={option.option_id}
              onClick={() => !isClosed && onVote(poll.id, option.option_id)}
              disabled={isClosed}
              className={clsx(
                'relative w-full text-left rounded-full overflow-hidden border px-3.5 py-2.5 transition',
                isClosed ? 'cursor-default' : 'hover:border-primary/40 active:scale-[0.99]',
                isMyVote ? 'border-primary/50' : isWinner ? 'border-accent/60' : 'border-border',
              )}
            >
              {totalVotes > 0 && (
                <div
                  aria-hidden="true"
                  className={clsx('absolute inset-y-0 left-0 rounded-full', isMyVote ? 'bg-primary/15' : isWinner ? 'bg-accent/25' : 'bg-muted')}
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative flex items-center justify-between gap-2">
                <span className={clsx('flex items-center gap-1.5 text-sm font-medium', isMyVote ? 'text-primary' : isWinner ? 'text-accent-foreground' : 'text-foreground')}>
                  {(isMyVote || isWinner) && <Check size={14} aria-hidden="true" className={isMyVote ? 'text-primary shrink-0' : 'text-accent-foreground shrink-0'} />}
                  {option.text}
                </span>
                <span className={clsx('text-xs font-semibold shrink-0', isMyVote ? 'text-primary' : 'text-muted-foreground')}>
                  {pct}% ({option.voters.length} vote{option.voters.length > 1 ? 's' : ''})
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {isClosed ? <span className="flex items-center gap-1"><Lock size={11} aria-hidden="true" /> Sondage fermé</span> : `${totalVotes} vote${totalVotes > 1 ? 's' : ''}`}
        </span>
        {canClose && (
          <button
            type="button"
            onClick={() => onClose(poll.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium hover:bg-muted/70 transition"
          >
            <Lock size={11} aria-hidden="true" /> Fermer
          </button>
        )}
      </div>
    </div>
  )
}
