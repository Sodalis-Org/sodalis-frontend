import { useEffect, useId, useState } from 'react'
import { useQuery } from '@apollo/client'
import { Bell, X, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { clsx } from 'clsx'
import { useSocket } from '../context/SocketContext'
import { useAuthContext } from '../context/AuthContext'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { GET_NOTIFICATIONS } from '../graphql/dashboard'
import { NOTIF_ICONS, NOTIF_COLORS } from '../lib/notifications'
import { timeAgo } from '../lib/time'

// ─── Bell button ──────────────────────────────────────────────────────────────

export function NotificationBell({ onClick }) {
  const { unreadCount } = useSocket()
  return (
    <button
      onClick={onClick}
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
      className="relative w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition shadow-sm"
    >
      <Bell size={17} aria-hidden="true" />
      {unreadCount > 0 && (
        <span aria-hidden="true" className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15

export function NotificationDrawer({ open, onClose }) {
  const titleId = useId()
  const panelRef = useFocusTrap({ active: open, onClose })
  const { user } = useAuthContext()
  const { notifications: liveNotifs, unreadCount, markAllRead } = useSocket()
  const [page, setPage] = useState(1)

  const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { colocId: user?.coloc_id, page, limit: PAGE_SIZE },
    skip: !open || !user?.coloc_id,
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (open) {
      markAllRead()
      setPage(1)
    }
  }, [open, markAllRead])

  const historical = data?.notifications?.data ?? []
  const pagination = data?.notifications?.pagination
  const hasMore    = pagination ? page * pagination.limit < pagination.total : false

  // Merge: live first, then historical deduped
  const liveIds    = new Set(liveNotifs.map((n) => n.id).filter(Boolean))
  const merged = [
    ...liveNotifs,
    ...historical.filter((n) => !liveIds.has(n.id)),
  ]

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fermer"
        className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-sm cursor-default"
        onClick={onClose}
      />

      {/* Panel — au-dessus de la nav du bas (z-50) pour ne jamais lui laisser
          masquer le bas de la liste ou le pied de page. */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="fixed top-0 right-0 bottom-0 z-[60] w-full max-w-sm bg-background shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-border" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top))' }}>
          <div className="flex items-center gap-2">
            <Bell size={18} aria-hidden="true" className="text-primary" />
            <h2 id={titleId} className="text-base font-bold text-foreground">Notifications</h2>
            {unreadCount === 0 && liveNotifs.length > 0 && (
              <span className="text-xs text-muted-foreground">(tout lu)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SocketStatus />
            <button
              onClick={() => { setPage(1); refetch() }}
              aria-label="Rafraîchir les notifications"
              className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition"
            >
              <RefreshCw size={14} aria-hidden="true" />
            </button>
            <button
              onClick={onClose}
              aria-label="Fermer les notifications"
              className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {merged.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <Bell size={36} aria-hidden="true" className="text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Aucune notification pour le moment.</p>
              <p className="text-xs text-muted-foreground/70">Les événements de la colocation apparaîtront ici en temps réel.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-4">
              {/* Live section label */}
              {liveNotifs.length > 0 && (
                <div className="px-3.5 py-2 rounded-xl bg-primary/10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Temps réel · {liveNotifs.length} nouveau{liveNotifs.length > 1 ? 'x' : ''}
                  </span>
                </div>
              )}

              {merged.map((notif, i) => {
                const isLive = i < liveNotifs.length
                return (
                  <div
                    key={notif.id ?? notif._id ?? i}
                    className={clsx(
                      'flex items-start gap-3 rounded-2xl border-l-[3px] bg-card shadow-sm p-3.5 transition',
                      NOTIF_COLORS[notif.type] ?? 'border-l-border',
                      isLive && 'ring-1 ring-primary/20'
                    )}
                  >
                    <span aria-hidden="true" className="text-xl leading-none mt-0.5 shrink-0">
                      {NOTIF_ICONS[notif.type] ?? '📣'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{notif.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {notif.type && (
                          <span className="text-xs text-muted-foreground font-mono">{notif.type}</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(notif.created_at ?? notif.createdAt)}
                        </span>
                        {isLive && (
                          <span className="text-xs text-primary font-medium">Live</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Pagination */}
              {hasMore && (
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-muted border border-border text-sm text-muted-foreground font-medium hover:bg-muted/70 transition disabled:opacity-50"
                >
                  {loading ? 'Chargement…' : 'Charger plus'}
                </button>
              )}

              {loading && merged.length === 0 && (
                <div role="status" aria-live="polite" className="flex flex-col gap-2">
                  <span className="sr-only">Chargement en cours</span>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} aria-hidden="true" className="h-14 rounded-2xl bg-muted animate-pulse" />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — total */}
        {pagination && (
          <div className="px-4 pt-3 border-t border-border bg-muted" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
            <p className="text-xs text-muted-foreground text-center">
              {pagination.total} notification{pagination.total > 1 ? 's' : ''} au total · page {page}/{Math.ceil(pagination.total / pagination.limit)}
            </p>
          </div>
        )}
      </div>
    </>
  )
}

// ─── Socket status indicator ──────────────────────────────────────────────────

function SocketStatus() {
  const { socket } = useSocket()
  const [connected, setConnected] = useState(socket?.connected ?? false)

  useEffect(() => {
    if (!socket) return
    const onConnect    = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    setConnected(socket.connected)
    return () => { socket.off('connect', onConnect); socket.off('disconnect', onDisconnect) }
  }, [socket])

  return (
    <div className={clsx('flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
      connected ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'
    )}>
      {connected ? <Wifi size={11} aria-hidden="true" /> : <WifiOff size={11} aria-hidden="true" />}
      {connected ? 'Live' : 'Hors ligne'}
    </div>
  )
}
