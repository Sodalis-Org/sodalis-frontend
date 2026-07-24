import { clsx } from 'clsx'

const BADGE_STYLES = {
  thank: 'bg-accent/20 text-accent-foreground',
  poll: 'bg-muted text-muted-foreground',
  complaint: 'bg-primary/10 text-primary',
  'complaint-anonymous': 'bg-muted text-muted-foreground',
}

export default function FeedItem({ type, icon: Icon, isLast, children }) {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={clsx('w-9 h-9 rounded-full flex items-center justify-center shrink-0', BADGE_STYLES[type])}>
          <Icon size={16} aria-hidden="true" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border my-1" />}
      </div>
      <div className="flex-1 min-w-0 pb-5">{children}</div>
    </li>
  )
}
