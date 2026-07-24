import { clsx } from 'clsx'
import { Star } from 'lucide-react'

export default function HarmonyToast({ completed }) {
  if (!completed) return null
  return (
    <div role="status" aria-live="polite" className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div
        className={clsx(
          'flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg text-sm font-semibold',
          completed.isOnTime ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground',
        )}
      >
        <Star size={15} aria-hidden="true" />
        <span>+{completed.points} Harmony{completed.isOnTime ? ' · Dans les temps !' : ''}</span>
      </div>
    </div>
  )
}
