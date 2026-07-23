import { useState } from 'react'
import {
  Plus, X, Clock, CheckCircle2, Circle,
  ArrowRight, RotateCcw, ChevronDown, AlertTriangle,
  Loader2, Star, CalendarDays
} from 'lucide-react'
import { clsx } from 'clsx'
import { useLabor } from '../../hooks/useLabor'
import Avatar from '../../components/Avatar'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META = {
  TODO:        { label: 'À faire',  color: 'bg-gray-100 text-gray-600',  dot: 'bg-gray-400'   },
  IN_PROGRESS: { label: 'En cours', color: 'bg-blue-100 text-blue-700',  dot: 'bg-blue-500'   },
  DONE:        { label: 'Terminé',  color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
}

function isOverdue(due_at) {
  if (!due_at) return false
  return new Date() > new Date(due_at)
}

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('fr', { day: 'numeric', month: 'short' })
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function SelectField({ label, value, onChange, options, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition pr-8"
        >
          <option value="">-- Choisir --</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

// ─── Score toast ──────────────────────────────────────────────────────────────

function ScoreToast({ completed }) {
  if (!completed) return null
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className={clsx(
        'flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg text-sm font-semibold text-white',
        completed.isOnTime ? 'bg-indigo-600' : 'bg-indigo-400'
      )}>
        <Star size={15} />
        <span>+{completed.points} Harmony{completed.isOnTime ? ' · Dans les temps !' : ''}</span>
      </div>
    </div>
  )
}

// ─── Create task modal ────────────────────────────────────────────────────────

function CreateTaskModal({ onClose, onCreate, loading, error, members }) {
  const [title, setTitle]           = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [dueAt, setDueAt]           = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await onCreate({
      title: title.trim(),
      assignee_id: assigneeId,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
    })
    if (ok) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Nouvelle tâche</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-title" className="text-sm font-medium text-gray-700">Titre</label>
            <input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={150}
              placeholder="Ex: Passer l'aspirateur au salon"
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <SelectField
            label="Assigner à"
            value={assigneeId}
            onChange={setAssigneeId}
            required
            options={members.map((m) => ({ value: m.id, label: m.name }))}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-due-at" className="text-sm font-medium text-gray-700">
              Date limite <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <div className="relative">
              <input
                id="task-due-at"
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <CalendarDays size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs">
            <Star size={13} className="mt-0.5 shrink-0" />
            <span>Terminer avant la date limite rapporte <strong>+10 Harmony</strong>. Après : +2.</span>
          </div>

          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1.5">
              <AlertTriangle size={13} /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 transition mt-1"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Créer la tâche</>}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Task card ────────────────────────────────────────────────────────────────

function TaskCard({ task, members, currentUserId, onAdvance, onRevert }) {
  const assignee = members.find((m) => m.id === task.assignee_id)
  const meta     = STATUS_META[task.status]
  const overdue  = isOverdue(task.due_at) && task.status !== 'DONE'
  const isAssignedToMe = task.assignee_id === currentUserId
  const isDone   = task.status === 'DONE'

  return (
    <div className={clsx(
      'bg-white rounded-2xl border p-4 flex flex-col gap-3 transition',
      isDone ? 'border-gray-100 opacity-60' : overdue ? 'border-red-200' : 'border-gray-200'
    )}>
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <button
          onClick={() => !isDone && onAdvance(task)}
          disabled={isDone}
          className={clsx(
            'mt-0.5 shrink-0 transition',
            isDone ? 'text-green-500 cursor-default' : 'text-gray-300 hover:text-indigo-500'
          )}
        >
          {isDone
            ? <CheckCircle2 size={22} />
            : task.status === 'IN_PROGRESS'
              ? <CheckCircle2 size={22} className="text-blue-400" />
              : <Circle size={22} />
          }
        </button>

        <div className="flex-1 min-w-0">
          <p className={clsx('text-sm font-semibold leading-snug', isDone ? 'line-through text-gray-400' : 'text-gray-900')}>
            {task.title}
          </p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {assignee && (
              <div className="flex items-center gap-1.5">
                <Avatar name={assignee.name} size="xs" />
                <span className={clsx('text-xs', isAssignedToMe ? 'text-indigo-600 font-medium' : 'text-gray-500')}>
                  {isAssignedToMe ? 'Moi' : assignee.name}
                </span>
              </div>
            )}
            {task.due_at && (
              <div className={clsx('flex items-center gap-1 text-xs', overdue ? 'text-red-500 font-medium' : 'text-gray-400')}>
                <Clock size={11} />
                <span>{overdue && !isDone ? 'En retard · ' : ''}{formatDate(task.due_at)}</span>
              </div>
            )}
          </div>
        </div>

        <span className={clsx('px-2 py-0.5 rounded-lg text-xs font-medium shrink-0', meta.color)}>
          {meta.label}
        </span>
      </div>

      {/* Actions — only for assignee or if overdue */}
      {!isDone && (isAssignedToMe || overdue) && (
        <div className="flex gap-2 pt-1 border-t border-gray-50">
          <button
            onClick={() => onAdvance(task)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition"
          >
            <ArrowRight size={13} />
            {task.status === 'TODO' ? 'Démarrer' : 'Marquer terminé'}
          </button>
          {task.status === 'IN_PROGRESS' && (
            <button
              onClick={() => onRevert(task)}
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gray-50 text-gray-500 text-xs hover:bg-gray-100 transition"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

function TaskSection({ title, tasks, statusDot, emptyLabel, children }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 text-left"
      >
        <span className={clsx('w-2 h-2 rounded-full shrink-0', statusDot)} />
        <span className="text-sm font-semibold text-gray-600">{title}</span>
        <span className="text-xs text-gray-400 font-medium">({tasks.length})</span>
        <ChevronDown size={14} className={clsx('text-gray-400 ml-auto transition-transform', collapsed && '-rotate-90')} />
      </button>

      {!collapsed && (
        tasks.length === 0 ? (
          <p className="text-xs text-gray-400 pl-4 py-2">{emptyLabel}</p>
        ) : (
          <div className="flex flex-col gap-2">{children}</div>
        )
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Labor() {
  const [activeTab, setActiveTab]         = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const {
    loading,
    createLoading,
    formError,
    setFormError,
    grouped,
    members,
    currentUserId,
    createTask,
    advanceStatus,
    revertStatus,
    lastCompleted,
  } = useLabor()

  const myTasks = {
    TODO:        grouped.TODO.filter((t) => t.assignee_id === currentUserId),
    IN_PROGRESS: grouped.IN_PROGRESS.filter((t) => t.assignee_id === currentUserId),
    DONE:        grouped.DONE.filter((t) => t.assignee_id === currentUserId),
  }

  const displayed = activeTab === 'mine' ? myTasks : grouped

  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />)}
      </div>
    )
  }

  return (
    <>
      <ScoreToast completed={lastCompleted} />

      {showCreateModal && (
        <CreateTaskModal
          onClose={() => { setShowCreateModal(false); setFormError(null) }}
          onCreate={createTask}
          loading={createLoading}
          error={formError}
          members={members}
        />
      )}

      <div className="flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Labor</h1>
              <p className="text-xs text-gray-400 mt-0.5">Tâches &amp; corvées</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            >
              <Plus size={16} /> Créer
            </button>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
            {[
              { value: 'all',  label: 'Toutes' },
              { value: 'mine', label: 'Mes tâches' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={clsx(
                  'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
                  activeTab === tab.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-px bg-gray-100 border-b border-gray-100">
          {[
            { label: 'À faire',   count: displayed.TODO.length,        color: 'text-gray-700'  },
            { label: 'En cours',  count: displayed.IN_PROGRESS.length,  color: 'text-blue-600'  },
            { label: 'Terminées', count: displayed.DONE.length,          color: 'text-green-600' },
          ].map(({ label, count, color }) => (
            <div key={label} className="bg-white py-3 flex flex-col items-center">
              <span className={clsx('text-xl font-bold', color)}>{count}</span>
              <span className="text-xs text-gray-400">{label}</span>
            </div>
          ))}
        </div>

        {/* Task sections */}
        <div className="px-4 pt-5 pb-4 flex flex-col gap-6">
          <TaskSection
            title="À faire"
            tasks={displayed.TODO}
            statusDot={STATUS_META.TODO.dot}
            emptyLabel="Aucune tâche à faire"
          >
            {displayed.TODO.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                members={members}
                currentUserId={currentUserId}
                onAdvance={advanceStatus}
                onRevert={revertStatus}
              />
            ))}
          </TaskSection>

          <TaskSection
            title="En cours"
            tasks={displayed.IN_PROGRESS}
            statusDot={STATUS_META.IN_PROGRESS.dot}
            emptyLabel="Aucune tâche en cours"
          >
            {displayed.IN_PROGRESS.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                members={members}
                currentUserId={currentUserId}
                onAdvance={advanceStatus}
                onRevert={revertStatus}
              />
            ))}
          </TaskSection>

          <TaskSection
            title="Terminées"
            tasks={displayed.DONE}
            statusDot={STATUS_META.DONE.dot}
            emptyLabel="Aucune tâche terminée"
          >
            {displayed.DONE.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                members={members}
                currentUserId={currentUserId}
                onAdvance={advanceStatus}
                onRevert={revertStatus}
              />
            ))}
          </TaskSection>
        </div>
      </div>
    </>
  )
}
