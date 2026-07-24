import { useState } from 'react'
import { Copy, Check, LogOut, RefreshCw, DoorOpen, Home, Shield } from 'lucide-react'
import { useQuery } from '@apollo/client'
import { useAuthContext } from '../../context/AuthContext'
import { useAuth } from '../../hooks/useAuth'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { GET_MY_COLOC } from '../../graphql/auth'
import Avatar from '../../components/Avatar'
import LoadingSpinner from '../../components/LoadingSpinner'
import QueryErrorState from '../../components/QueryErrorState'

export default function Profile() {
  useDocumentTitle('Profil')
  const { user } = useAuthContext()
  const {
    leaveColoc,
    regenerateInviteCode,
    logout,
    error,
    setError,
    loading: actionLoading,
  } = useAuth()

  const {
    data,
    loading: colocLoading,
    error: colocError,
    refetch,
  } = useQuery(GET_MY_COLOC, { skip: !user?.coloc_id })

  const coloc = data?.myColoc ?? null
  const isAdmin = user?.role === 'ADMIN'

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
    setError(null)
    const ok = await leaveColoc()
    if (ok) setConfirmLeave(false)
  }

  const handleRegen = async () => {
    setError(null)
    const updated = await regenerateInviteCode()
    if (updated) {
      setConfirmRegen(false)
      await refetch()
    }
  }

  if (colocLoading) {
    return (
      <div className="flex justify-center pt-20">
        <LoadingSpinner size={28} />
      </div>
    )
  }

  if (colocError) {
    return <QueryErrorState onRetry={() => refetch()} />
  }

  return (
    <div className="flex flex-col px-4 pt-10 pb-8 gap-5 max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
        <Avatar name={user?.name ?? ''} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-gray-900 truncate">{user?.name}</h1>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">
            <Shield size={12} aria-hidden="true" />
            {isAdmin ? 'Administrateur' : 'Membre'}
          </span>
        </div>
      </div>

      {coloc && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-gray-800">
            <Home size={16} aria-hidden="true" className="text-indigo-600" />
            <h2 className="text-sm font-semibold">Colocation</h2>
          </div>
          <p className="text-base font-bold text-gray-900">{coloc.name}</p>

          {isAdmin && coloc.invite_code && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-3 flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                Code d&apos;invitation
              </span>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm font-bold text-gray-900 break-all">
                  {coloc.invite_code}
                </code>
                <button
                  type="button"
                  onClick={copyInvite}
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-indigo-100 text-xs font-semibold text-indigo-700"
                >
                  {copied ? <Check size={14} aria-hidden="true" className="text-green-600" /> : <Copy size={14} aria-hidden="true" />}
                  {copied ? 'Copié' : 'Copier'}
                </button>
              </div>
              {!confirmRegen ? (
                <button
                  type="button"
                  onClick={() => setConfirmRegen(true)}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 mt-1"
                >
                  <RefreshCw size={13} aria-hidden="true" /> Régénérer le code
                </button>
              ) : (
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleRegen}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold disabled:opacity-60"
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRegen(false)}
                    className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {!confirmLeave ? (
          <button
            type="button"
            onClick={() => setConfirmLeave(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-800 text-sm font-semibold"
          >
            <DoorOpen size={16} aria-hidden="true" /> Quitter la colocation
          </button>
        ) : (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 flex flex-col gap-2">
            <p className="text-xs text-orange-900">Vous quitterez l&apos;espace et perdrez l&apos;accès aux services.</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleLeave}
                className="flex-1 py-2 rounded-xl bg-orange-600 text-white text-xs font-semibold disabled:opacity-60"
              >
                Confirmer
              </button>
              <button
                type="button"
                onClick={() => setConfirmLeave(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold"
        >
          <LogOut size={16} aria-hidden="true" /> Se déconnecter
        </button>
      </div>
    </div>
  )
}
