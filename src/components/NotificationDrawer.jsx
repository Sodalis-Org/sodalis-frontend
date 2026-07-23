import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { Bell, X, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { clsx } from 'clsx'
import { useSocket } from '../context/SocketContext'
import { useAuthContext } from '../context/AuthContext'
import { GET_NOTIFICATIONS } from '../graphql/dashboard'

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTIF_ICONS = {
  NEW_TASK:                    '📋',
  TASK_UPDATED:                '🔄',
  TASK_COMPLETED_SCORE_UPDATE: '⭐',
  NEW_MAINTENANCE_TICKET:      '🔧',
  MAINTENANCE_TICKET_UPDATED:  '🔧',
  MAINTENANCE_TICKET_ASSIGNED: '👤',
  NEW_COMPLAINT:               '⚠️',
  COMPLAINT_TARGETED:          '🎯',
  COMPLAINT_RESOLVED:          '✅',
  COMPLAINT_DELETED:           '🗑️',
  NEW_POLL:                    '🗳️',
  POLL_UPDATED:                '🗳️',
}

const NOTIF_COLORS = {
  NEW_TASK:                    'border-l-blue-400',
  TASK_COMPLETED_SCORE_UPDATE: 'border-l-green-400',
  NEW_MAINTENANCE_TICKET:      'border-l-orange-400',
  MAINTENANCE_TICKET_UPDATED:  'border-l-orange-300',
  NEW_COMPLAINT:               'border-l-red-400',
  COMPLAINT_TARGETED:          'border-l-red-500',
  COMPLAINT_RESOLVED:          'border-l-green-400',
  NEW_POLL:                    'border-l-indigo-400',
  POLL_UPDATED:                'border-l-indigo-300',
}

function timeAgo(isoDate) {
  if (!isoDate) return ''
  const diff = Date.now() - new Date(isoDate).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "à l'instant"
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h} h`
  return `il y a ${Math.floor(h / 24)} j`
}

// ─── Bell button ──────────────────────────────────────────────────────────────

export function NotificationBell({ onClick }) {
  const { unreadCount } = useSocket()
  return (
    <button
      onClick={onClick}
      className="relative w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition shadow-sm"
    >
      <Bell size={17} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15

export function NotificationDrawer({ open, onClose }) {
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
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm cursor-default"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-12 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-indigo-600" />
            <h2 className="text-base font-bold text-gray-900">Notifications</h2>
            {unreadCount === 0 && liveNotifs.length > 0 && (
              <span className="text-xs text-gray-400">(tout lu)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SocketStatus />
            <button
              onClick={() => { setPage(1); refetch() }}
              className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {merged.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <Bell size={36} className="text-gray-200" />
              <p className="text-sm text-gray-400">Aucune notification pour le moment.</p>
              <p className="text-xs text-gray-300">Les événements de la colocation apparaîtront ici en temps réel.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-50">
              {/* Live section label */}
              {liveNotifs.length > 0 && (
                <div className="px-4 py-2 bg-indigo-50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
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
                      'flex items-start gap-3 px-4 py-3.5 border-l-[3px] transition',
                      NOTIF_COLORS[notif.type] ?? 'border-l-gray-200',
                      isLive ? 'bg-indigo-50/30' : 'bg-white'
                    )}
                  >
                    <span className="text-xl leading-none mt-0.5 shrink-0">
                      {NOTIF_ICONS[notif.type] ?? '📣'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">{notif.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {notif.type && (
                          <span className="text-xs text-gray-400 font-mono">{notif.type}</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {timeAgo(notif.created_at ?? notif.createdAt)}
                        </span>
                        {isLive && (
                          <span className="text-xs text-indigo-500 font-medium">Live</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Pagination */}
              {hasMore && (
                <div className="p-4">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    {loading ? 'Chargement…' : 'Charger plus'}
                  </button>
                </div>
              )}

              {loading && merged.length === 0 && (
                <div className="flex flex-col gap-3 p-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — total */}
        {pagination && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400 text-center">
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
      connected ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
    )}>
      {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
      {connected ? 'Live' : 'Hors ligne'}
    </div>
  )
}
