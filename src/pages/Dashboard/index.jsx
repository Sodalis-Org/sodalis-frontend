import { RefreshCw, LogOut, Star, Heart, CheckSquare, AlertTriangle, Bell, Clock, MessageSquare } from 'lucide-react'
import { clsx } from 'clsx'
import { useDashboard } from '../../hooks/useDashboard'
import { useAuth } from '../../hooks/useAuth'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAuthContext } from '../../context/AuthContext'
import Avatar from '../../components/Avatar'

// ─── Shared primitives ────────────────────────────────────────────────────────

function ScoreCard({ label, value, icon: Icon, color }) {
  return (
    <div className={clsx('flex-1 rounded-2xl p-4 flex flex-col gap-2', color)}>
      <div className="flex items-center gap-2 opacity-80">
        <Icon size={14} strokeWidth={2.5} />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-3xl font-bold">{value ?? '—'}</span>
    </div>
  )
}

const PRIORITY_COLORS = {
  URGENT: 'bg-red-100 text-red-700 border-red-200',
  HIGH:   'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW:    'bg-green-100 text-green-700 border-green-200',
}

const STATUS_COLORS = {
  TODO:        'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE:        'bg-green-100 text-green-700',
}

const NOTIF_ICONS = {
  NEW_TASK:                    '📋',
  TASK_UPDATED:                '🔄',
  TASK_COMPLETED_SCORE_UPDATE: '✅',
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

function timeAgo(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'à l\'instant'
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h} h`
  return `il y a ${Math.floor(h / 24)} j`
}

function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
      {count !== undefined && (
        <span className="text-xs font-medium text-gray-600">{count}</span>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3 px-4 pt-4">
      <span className="sr-only">Chargement en cours</span>
      {[1, 2, 3].map((i) => (
        <div key={i} aria-hidden="true" className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  useDocumentTitle('Tableau de bord')
  const { user } = useAuthContext()
  const { logout } = useAuth()
  const {
    loading,
    error,
    refetch,
    currentUser,
    taskCounts,
    myTasks,
    alertTickets,
    notifications,
    members,
    openComplaints,
  } = useDashboard()

  if (loading) return <LoadingState />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3 px-6 text-center">
        <AlertTriangle size={32} className="text-red-400" />
        <p className="text-gray-600 text-sm">Impossible de charger les données.</p>
        <button
          onClick={() => refetch()}
          className="text-indigo-600 text-sm font-medium flex items-center gap-1"
        >
          <RefreshCw size={14} /> Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-2">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name ?? ''} size="lg" />
            <div>
              <p className="text-xs text-gray-600 font-medium">Bonjour,</p>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{user?.name ?? 'Colocataire'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              aria-label="Rafraîchir le tableau de bord"
              className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={logout}
              aria-label="Se déconnecter"
              className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Scores */}
        <div className="flex gap-3">
          <ScoreCard
            label="Harmony"
            value={currentUser?.harmony_score}
            icon={Star}
            color="bg-indigo-50 text-indigo-800"
          />
          <ScoreCard
            label="Karma"
            value={currentUser?.karma_score}
            icon={Heart}
            color="bg-purple-50 text-purple-800"
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 pt-5">
        {/* ── Alertes maintenance ── */}
        {alertTickets.length > 0 && (
          <section>
            <SectionHeader title="Alertes" count={alertTickets.length} />
            <div className="flex flex-col gap-2">
              {alertTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={clsx(
                    'flex items-center gap-3 p-3.5 rounded-2xl border bg-white',
                    PRIORITY_COLORS[ticket.priority] ?? 'bg-white border-gray-100'
                  )}
                >
                  <AlertTriangle size={18} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ticket.title}</p>
                    <p className="text-xs opacity-70 mt-0.5">{ticket.category} · {ticket.status}</p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide shrink-0">
                    {ticket.priority}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Mes tâches ── */}
        <section>
          <SectionHeader title="Mes tâches" count={myTasks.length} />
          {myTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <CheckSquare size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-600">Aucune tâche assignée</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {myTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="bg-white rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3">
                  <span className={clsx('px-2 py-0.5 rounded-lg text-xs font-medium shrink-0', STATUS_COLORS[task.status])}>
                    {task.status === 'TODO' ? 'À faire' : task.status === 'IN_PROGRESS' ? 'En cours' : 'Terminé'}
                  </span>
                  <p className="text-sm font-medium text-gray-800 flex-1 min-w-0 truncate">{task.title}</p>
                  {task.due_at && (
                    <div className="flex items-center gap-1 text-gray-600 shrink-0">
                      <Clock size={12} />
                      <span className="text-xs">{new Date(task.due_at).toLocaleDateString('fr', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Résumé global ── */}
        <section>
          <SectionHeader title="Colocation" />
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'À faire',   value: taskCounts.todo,       color: 'bg-gray-50 text-gray-700' },
              { label: 'En cours',  value: taskCounts.inProgress,  color: 'bg-blue-50 text-blue-700' },
              { label: 'Terminées', value: taskCounts.done,         color: 'bg-green-50 text-green-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className={clsx('rounded-2xl p-3 text-center', color)}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs font-medium mt-1 opacity-80">{label}</p>
              </div>
            ))}
          </div>
          {openComplaints > 0 && (
            <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl p-3.5">
              <MessageSquare size={16} className="shrink-0" />
              <p className="text-sm font-medium">
                {openComplaints} plainte{openComplaints > 1 ? 's' : ''} ouverte{openComplaints > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </section>

        {/* ── Membres ── */}
        <section>
          <SectionHeader title="Membres" count={members.length} />
          <div className="flex flex-col gap-2">
            {[...members]
              .sort((a, b) => (b.harmony_score + b.karma_score) - (a.harmony_score + a.karma_score))
              .map((member, i) => (
                <div key={member.id} className="bg-white rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-5 text-center">#{i + 1}</span>
                  <Avatar name={member.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800 truncate">{member.name}</p>
                      {member.role === 'ADMIN' && (
                        <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-medium shrink-0">Admin</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 shrink-0">
                    <span className="flex items-center gap-1"><Star size={11} className="text-indigo-400" />{member.harmony_score}</span>
                    <span className="flex items-center gap-1"><Heart size={11} className="text-purple-400" />{member.karma_score}</span>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* ── Notifications ── */}
        <section>
          <SectionHeader title="Activité récente" count={notifications.length > 0 ? `${notifications.length}` : undefined} />
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <Bell size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-600">Aucune activité récente</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {notifications.map((notif, i) => (
                <div
                  key={notif.id ?? notif._id ?? i}
                  className="bg-white rounded-2xl border border-gray-100 p-3.5 flex items-start gap-3"
                >
                  <span className="text-lg leading-none mt-0.5 shrink-0">
                    {NOTIF_ICONS[notif.type] ?? '📣'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">{notif.message}</p>
                    {notif.created_at && (
                      <p className="text-xs text-gray-600 mt-1">{timeAgo(notif.created_at)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
