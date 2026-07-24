import { useState } from 'react'
import { Heart, Sparkles, AlertTriangle } from 'lucide-react'
import Avatar from '../../../components/Avatar'
import Modal from '../../../components/Modal'
import LoadingSpinner from '../../../components/LoadingSpinner'

const THANK_COOLDOWN_MS = 24 * 60 * 60 * 1000

function formatThankCooldown(createdAt) {
  const availableAt = new Date(createdAt).getTime() + THANK_COOLDOWN_MS
  const ms = availableAt - Date.now()
  if (ms <= 0) return null
  const h = Math.floor(ms / 3600000)
  const m = Math.max(1, Math.ceil((ms % 3600000) / 60000))
  if (h >= 20) return 'Demain'
  if (h > 0) return `Dans ${h} h`
  return `Dans ${m} min`
}

export default function KarmaSheet({ members, currentUserId, recentThanks, onThank, karmaError, onClose }) {
  const [thankingId, setThankingId] = useState(null)

  const cooldownByTarget = {}
  for (const thank of recentThanks) {
    if (cooldownByTarget[thank.to_id]) continue
    const label = formatThankCooldown(thank.createdAt)
    if (label) cooldownByTarget[thank.to_id] = label
  }

  const handleThank = async (member) => {
    setThankingId(member.id)
    await onThank(member.id, member.name)
    setThankingId(null)
  }

  return (
    <Modal title="Karma de la coloc" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2 p-3 rounded-xl bg-accent/10 border border-accent/25 text-accent-foreground text-xs">
          <Sparkles size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>1 remerciement par personne toutes les 24 h &middot; la cible reçoit <strong>+3 Karma</strong>.</span>
        </div>

        {karmaError && (
          <p role="alert" className="text-xs text-destructive flex items-center gap-1.5 px-1">
            <AlertTriangle size={13} aria-hidden="true" /> {karmaError}
          </p>
        )}

        {[...members]
          .filter((m) => m.id !== currentUserId)
          .sort((a, b) => b.karma_score - a.karma_score)
          .map((member) => {
            const cooldownLabel = cooldownByTarget[member.id]
            const isThanking = thankingId === member.id
            const disabled = isThanking || Boolean(cooldownLabel)

            return (
              <div key={member.id} className="bg-card rounded-2xl border border-border p-3 flex items-center gap-3">
                <Avatar name={member.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Heart size={11} aria-hidden="true" className="text-accent-foreground" />
                    <span className="text-xs text-accent-foreground font-medium">{member.karma_score} karma</span>
                  </div>
                </div>
                <button
                  onClick={() => handleThank(member)}
                  disabled={disabled}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-accent/20 text-accent-foreground text-xs font-semibold hover:bg-accent/30 disabled:opacity-50 transition"
                >
                  {isThanking
                    ? <LoadingSpinner size={13} />
                    : cooldownLabel
                      ? cooldownLabel
                      : <><Heart size={13} aria-hidden="true" /> Remercier</>
                  }
                </button>
              </div>
            )
          })}
      </div>
    </Modal>
  )
}
