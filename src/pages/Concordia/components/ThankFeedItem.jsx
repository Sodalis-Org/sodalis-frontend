import { timeAgo } from '../../../lib/time'

export default function ThankFeedItem({ thank, createdAt }) {
  return (
    <div className="bg-accent/10 border border-accent/25 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-accent-foreground">Merci !</p>
        <span className="text-xs text-muted-foreground">{timeAgo(createdAt)}</span>
      </div>
      <p className="text-sm text-foreground leading-relaxed">
        <strong>{thank.fromName}</strong> a remercié <strong>{thank.toName}</strong>.
      </p>
      <span className="self-start px-2.5 py-1 rounded-lg bg-accent/20 text-accent-foreground text-xs font-medium">
        +3 Karma pour {thank.toName}
      </span>
    </div>
  )
}
