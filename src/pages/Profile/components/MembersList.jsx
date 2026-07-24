import { useState } from 'react'
import { Star, Heart, ShieldCheck, User } from 'lucide-react'
import Avatar from '../../../components/Avatar'

export default function MembersList({ members, currentUserId, isAdmin, onKick, onTransferAdmin, actionError }) {
  const [pendingKick, setPendingKick] = useState(null)
  const [pendingTransfer, setPendingTransfer] = useState(null)

  return (
    <div className="flex flex-col gap-2">
      {actionError && (
        <p role="alert" className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
          {actionError}
        </p>
      )}
      {members.map((member) => (
        <div key={member.id} className="rounded-2xl border border-border p-3.5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar name={member.name} />
              {member.id === currentUserId && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                {member.id === currentUserId && <span className="text-xs text-muted-foreground">(moi)</span>}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{member.email}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {member.role === 'ADMIN' ? (
                <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-lg font-medium">
                  <ShieldCheck size={11} aria-hidden="true" /> Admin
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-lg font-medium">
                  <User size={11} aria-hidden="true" /> Membre
                </span>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star size={10} aria-hidden="true" className="text-primary" />{member.harmony_score}</span>
                <span className="flex items-center gap-1"><Heart size={10} aria-hidden="true" className="text-accent-foreground" />{member.karma_score}</span>
              </div>
            </div>
          </div>

          {isAdmin && member.id !== currentUserId && (
            <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
              {member.role !== 'ADMIN' && (
                pendingTransfer === member.id ? (
                  <div className="flex gap-2 w-full">
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await onTransferAdmin(member.id)
                        if (ok) setPendingTransfer(null)
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                    >
                      Confirmer admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingTransfer(null)}
                      className="flex-1 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setPendingTransfer(member.id); setPendingKick(null) }}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold"
                  >
                    Nommer admin
                  </button>
                )
              )}
              {pendingKick === member.id ? (
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await onKick(member.id)
                      if (ok) setPendingKick(null)
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold"
                  >
                    Confirmer expulsion
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingKick(null)}
                    className="flex-1 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { setPendingKick(member.id); setPendingTransfer(null) }}
                  className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold"
                >
                  Expulser
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
