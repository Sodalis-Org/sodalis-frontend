import { Star, Heart } from 'lucide-react'
import { clsx } from 'clsx'

function ScoreCard({ label, value, caption, icon: Icon, bg, accent }) {
  return (
    <div className={clsx('flex-1 rounded-2xl p-4 flex flex-col gap-1', bg)}>
      <div className={clsx('flex items-center gap-2', accent)}>
        <Icon size={14} strokeWidth={2.5} aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-3xl font-bold text-foreground">{value ?? '—'}</span>
      <p className="text-xs text-muted-foreground">{caption}</p>
    </div>
  )
}

export default function ScoreSummary({ harmony, karma }) {
  return (
    <div className="flex gap-3">
      <ScoreCard
        label="Harmony"
        value={harmony}
        caption="Ta fiabilité au quotidien"
        icon={Star}
        bg="bg-primary/10"
        accent="text-primary"
      />
      <ScoreCard
        label="Karma"
        value={karma}
        caption="Ton entraide bienveillante"
        icon={Heart}
        bg="bg-accent/20"
        accent="text-accent-foreground"
      />
    </div>
  )
}
