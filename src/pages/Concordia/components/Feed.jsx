import { Heart, HelpCircle, Ghost, AlertTriangle, MessageCircle } from 'lucide-react'
import { buildFeed } from '../buildFeed'
import FeedItem from './FeedItem'
import ThankFeedItem from './ThankFeedItem'
import ComplaintFeedItem from './ComplaintFeedItem'
import PollFeedItem from './PollFeedItem'

function iconFor(item) {
  if (item.type === 'thank') return { type: 'thank', icon: Heart }
  if (item.type === 'poll') return { type: 'poll', icon: HelpCircle }
  return item.data.is_anonymous
    ? { type: 'complaint-anonymous', icon: Ghost }
    : { type: 'complaint', icon: AlertTriangle }
}

export default function Feed({
  complaints, polls, thanks, members, currentUserId, isAdmin,
  onResolveComplaint, onDeleteComplaint, onVotePoll, onClosePoll,
}) {
  const items = buildFeed({ complaints, polls, thanks, members })

  return (
    <div className="flex flex-col gap-4">
      {items.length > 0 && (
        <ul className="flex flex-col">
          {items.map((item, i) => {
            const { type, icon } = iconFor(item)
            return (
              <FeedItem key={item.key} type={type} icon={icon} isLast={i === items.length - 1}>
                {item.type === 'thank' && <ThankFeedItem thank={item.data} createdAt={item.createdAt} />}
                {item.type === 'poll' && (
                  <PollFeedItem
                    poll={item.data}
                    members={members}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    onVote={onVotePoll}
                    onClose={onClosePoll}
                  />
                )}
                {item.type === 'complaint' && (
                  <ComplaintFeedItem
                    complaint={item.data}
                    members={members}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    onResolve={onResolveComplaint}
                    onDelete={onDeleteComplaint}
                  />
                )}
              </FeedItem>
            )
          })}
        </ul>
      )}

      {items.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <MessageCircle size={28} aria-hidden="true" className="mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Rien pour le moment. Déposez un signalement ou lancez un sondage pour démarrer le fil.</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <MessageCircle size={26} aria-hidden="true" className="text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground/70 max-w-[220px]">La messagerie instantanée arrive bientôt dans la colocation !</p>
      </div>
    </div>
  )
}
