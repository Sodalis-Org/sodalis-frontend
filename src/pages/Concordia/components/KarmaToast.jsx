import { Sparkles } from 'lucide-react'

export default function KarmaToast({ feedback }) {
  if (!feedback) return null
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-accent shadow-lg text-sm font-semibold text-accent-foreground">
        <Sparkles size={15} aria-hidden="true" />
        <span>+3 Karma pour {feedback.name} · total : {feedback.score}</span>
      </div>
    </div>
  )
}
