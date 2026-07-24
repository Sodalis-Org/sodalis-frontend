import { useState } from 'react'
import { Copy, Check, LogOut, RefreshCw, DoorOpen, Home, Shield, Users2 } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { useDomus } from '../../hooks/useDomus'
import { useAuth } from '../../hooks/useAuth'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import Avatar from '../../components/Avatar'
import QueryErrorState from '../../components/QueryErrorState'
import MembersList from './components/MembersList'

export default function Profile() {
  useDocumentTitle('Profil')
  const { user } = useAuthContext()

  const {
    loading,
    error,
    refetch,
    regenerateLoading,
    actionError,
    setActionError,
    coloc,
    members,
    isAdmin,
    currentUserId,
    regenerateInvite,
    kickMember,
    transferAdmin,
  } = useDomus()

  const { leaveColoc, logout, error: authError, setError: setAuthError, loading: authActionLoading } = useAuth()

  const [copied, setCopied] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [confirmRegen, setConfirmRegen] = useState(false)

  const copyInvite = async () => {
    if (!coloc?.invite_code) return
    try {
      await navigator.clipboard.writeText(coloc.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const handleLeave = async () => {
    setAuthError(null)
    const ok = await leaveColoc()
    if (ok) setConfirmLeave(false)
  }

  const handleRegen = async () => {
    setActionError(null)
    const updated = await regenerateInvite()
    if (updated) setConfirmRegen(false)
  }

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="flex flex-col gap-3 px-4 pt-10">
        <span className="sr-only">Chargement en cours</span>
        {[1, 2, 3].map((i) => <div key={i} aria-hidden="true" className="h-20 rounded-2xl bg-muted animate-pulse" />)}
      </div>
    )
  }

  if (error) {
    return <QueryErrorState onRetry={() => refetch()} />
  }

  return (
    <div className="flex flex-col px-4 pt-10 pb-8 gap-5 max-w-lg mx-auto">
      <h1 className="sr-only">Profil</h1>

      {/* Identité */}
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
        <Avatar name={user?.name ?? ''} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-foreground truncate">{user?.name}</p>
          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
            <Shield size={12} aria-hidden="true" />
            {isAdmin ? 'Administrateur' : 'Membre'}
          </span>
        </div>
      </div>

      {/* Colocation */}
      {coloc && (
        <div className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 text-foreground mb-1">
              <Home size={16} aria-hidden="true" className="text-primary" />
              <h2 className="text-sm font-semibold">Colocation</h2>
            </div>
            <p className="text-base font-bold text-foreground">{coloc.name}</p>
          </div>

          {isAdmin && coloc.invite_code && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3 flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                Code d&apos;invitation
              </span>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm font-bold text-foreground break-all">
                  {coloc.invite_code}
                </code>
                <button
                  type="button"
                  onClick={copyInvite}
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-primary/20 text-xs font-semibold text-primary"
                >
                  {copied ? <Check size={14} aria-hidden="true" className="text-secondary" /> : <Copy size={14} aria-hidden="true" />}
                  {copied ? 'Copié' : 'Copier'}
                </button>
              </div>
              {!confirmRegen ? (
                <button
                  type="button"
                  onClick={() => { setConfirmRegen(true); setActionError(null) }}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 mt-1"
                >
                  <RefreshCw size={13} aria-hidden="true" /> Régénérer le code
                </button>
              ) : (
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    disabled={regenerateLoading}
                    onClick={handleRegen}
                    className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-60"
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRegen(false)}
                    className="flex-1 py-2 rounded-xl border border-border text-xs font-semibold text-foreground"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="pt-1 border-t border-border">
            <div className="flex items-center gap-2 text-foreground mb-3 mt-3">
              <Users2 size={16} aria-hidden="true" className="text-primary" />
              <h2 className="text-sm font-semibold">Membres</h2>
              <span className="text-xs text-muted-foreground font-medium">({members.length})</span>
            </div>
            <MembersList
              members={members}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onKick={kickMember}
              onTransferAdmin={transferAdmin}
              actionError={actionError}
            />
          </div>
        </div>
      )}

      {authError && (
        <p role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
          {authError}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {!confirmLeave ? (
          <button
            type="button"
            onClick={() => setConfirmLeave(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm font-semibold"
          >
            <DoorOpen size={16} aria-hidden="true" /> Quitter la colocation
          </button>
        ) : (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 flex flex-col gap-2">
            <p className="text-xs text-destructive">Vous quitterez l&apos;espace et perdrez l&apos;accès aux services.</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={authActionLoading}
                onClick={handleLeave}
                className="flex-1 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold disabled:opacity-60"
              >
                Confirmer
              </button>
              <button
                type="button"
                onClick={() => setConfirmLeave(false)}
                className="flex-1 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold"
        >
          <LogOut size={16} aria-hidden="true" /> Se déconnecter
        </button>
      </div>
    </div>
  )
}
