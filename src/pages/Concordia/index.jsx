import { useState } from 'react'
import {
  MessageSquare, BarChart2, Heart, Plus, X, Trash2,
  CheckCircle, EyeOff, User, Target, Loader2,
  AlertTriangle, ChevronDown, Sparkles, Lock
} from 'lucide-react'
import { clsx } from 'clsx'
import { useConcordia } from '../../hooks/useConcordia'
import Avatar from '../../components/Avatar'

// ─── Shared primitives ────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition pr-8"
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
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

// ─── Karma toast ──────────────────────────────────────────────────────────────

function KarmaToast({ feedback }) {
  if (!feedback) return null
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 shadow-lg text-sm font-semibold text-white">
        <Sparkles size={15} />
        <span>+3 Karma pour {feedback.name} · total : {feedback.score}</span>
      </div>
    </div>
  )
}

// ─── COMPLAINTS ───────────────────────────────────────────────────────────────

function CreateComplaintModal({ onClose, onCreate, loading, error, members, currentUserId }) {
  const [message, setMessage]       = useState('')
  const [targetId, setTargetId]     = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await onCreate({ message: message.trim(), target_id: targetId || null, is_anonymous: isAnonymous })
    if (ok) onClose()
  }

  const others = members.filter((m) => m.id !== currentUserId)

  return (
    <Modal title="Déposer une plainte" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="complaint-message" className="text-sm font-medium text-gray-700">Message</label>
          <textarea
            id="complaint-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            placeholder="Décrivez le problème..."
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <SelectField
          label="Cibler un colocataire (optionnel)"
          value={targetId}
          onChange={setTargetId}
          options={[{ value: '', label: '— Personne en particulier —' }, ...others.map((m) => ({ value: m.id, label: m.name }))]}
        />

        <button
          type="button"
          onClick={() => setIsAnonymous((a) => !a)}
          className={clsx(
            'flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition',
            isAnonymous ? 'bg-gray-900 border-gray-900 text-white' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
          )}
        >
          <EyeOff size={16} className="shrink-0" />
          <div className="flex flex-col items-start">
            <span>Plainte anonyme</span>
            <span className={clsx('text-xs font-normal', isAnonymous ? 'text-gray-300' : 'text-gray-400')}>
              {isAnonymous ? 'Votre identité sera masquée définitivement' : 'Votre nom sera visible'}
            </span>
          </div>
          <div className={clsx('ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0', isAnonymous ? 'bg-white border-white' : 'border-gray-300')}>
            {isAnonymous && <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />}
          </div>
        </button>

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
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><MessageSquare size={15} /> Déposer la plainte</>}
        </button>
      </form>
    </Modal>
  )
}

function ComplaintCard({ complaint, members, currentUserId, isAdmin, onResolve, onDelete }) {
  const creator = members.find((m) => m.id === complaint.creator_id)
  const target  = members.find((m) => m.id === complaint.target_id)
  const isResolved = complaint.status === 'RESOLVED'
  const canAct = isAdmin || complaint.creator_id === currentUserId

  return (
    <div className={clsx('bg-white rounded-2xl border p-4 flex flex-col gap-3', isResolved ? 'border-gray-100 opacity-60' : 'border-gray-200')}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {complaint.is_anonymous ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <EyeOff size={13} />
              <span className="font-medium">Auteur anonyme</span>
            </div>
          ) : creator ? (
            <div className="flex items-center gap-1.5">
              <Avatar name={creator.name} size="xs" />
              <span className="text-xs font-medium text-gray-700">{creator.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <User size={13} /> <span>Utilisateur supprimé</span>
            </div>
          )}

          {target && (
            <>
              <span className="text-gray-300 text-xs">→</span>
              <div className="flex items-center gap-1.5">
                <Target size={12} className="text-orange-400" />
                <span className="text-xs font-medium text-orange-600">{target.name}</span>
              </div>
            </>
          )}
        </div>

        <span className={clsx('px-2 py-0.5 rounded-lg text-xs font-medium shrink-0',
          isResolved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        )}>
          {isResolved ? 'Résolue' : 'Ouverte'}
        </span>
      </div>

      {/* Message */}
      <p className="text-sm text-gray-800 leading-relaxed">{complaint.message}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{timeAgo(complaint.createdAt)}</span>
        {canAct && !isResolved && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onResolve(complaint.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition"
            >
              <CheckCircle size={13} /> Résoudre
            </button>
            <button
              onClick={() => onDelete(complaint.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
        {canAct && isResolved && (
          <button
            onClick={() => onDelete(complaint.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-400 text-xs hover:bg-gray-100 transition"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

function ComplaintsTab({ complaints, members, currentUserId, isAdmin, onResolve, onDelete, onCreate, createLoading, error, setError }) {
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter]       = useState('open')

  const filtered = complaints.filter((c) =>
    filter === 'all'  ? true :
    filter === 'open' ? c.status === 'OPEN' :
                        c.status === 'RESOLVED'
  )

  return (
    <>
      {showModal && (
        <CreateComplaintModal
          onClose={() => { setShowModal(false); setError(null) }}
          onCreate={onCreate}
          loading={createLoading}
          error={error}
          members={members}
          currentUserId={currentUserId}
        />
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {[{ value: 'open', label: 'Ouvertes' }, { value: 'resolved', label: 'Résolues' }, { value: 'all', label: 'Toutes' }].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={clsx('px-3 py-1.5 rounded-xl text-xs font-medium transition',
                  filter === f.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >{f.label}</button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <Plus size={14} /> Déposer
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <MessageSquare size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">Aucune plainte {filter === 'open' ? 'ouverte' : filter === 'resolved' ? 'résolue' : ''}</p>
          </div>
        ) : (
          filtered.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              members={members}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onResolve={onResolve}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </>
  )
}

// ─── POLLS ────────────────────────────────────────────────────────────────────

function CreatePollModal({ onClose, onCreate, loading, error }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions]   = useState(['', ''])

  const updateOption = (i, val) => setOptions((prev) => prev.map((o, idx) => idx === i ? val : o))
  const addOption    = () => setOptions((prev) => prev.length < 6 ? [...prev, ''] : prev)
  const removeOption = (i) => setOptions((prev) => prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await onCreate({ question: question.trim(), options })
    if (ok) onClose()
  }

  return (
    <Modal title="Nouveau sondage" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="poll-question" className="text-sm font-medium text-gray-700">Question</label>
          <input
            id="poll-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            placeholder="Quel jour pour le grand ménage ?"
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Options <span className="text-gray-400 font-normal">(2–6)</span></span>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                required
                placeholder={`Option ${i + 1}`}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 text-xs text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition"
            >
              <Plus size={13} /> Ajouter une option
            </button>
          )}
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
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><BarChart2 size={15} /> Créer le sondage</>}
        </button>
      </form>
    </Modal>
  )
}

function PollCard({ poll, currentUserId, onVote }) {
  const totalVotes    = poll.options.reduce((sum, o) => sum + o.voters.length, 0)
  const userVotedOn   = poll.options.find((o) => o.voters.includes(currentUserId))
  const isClosed      = poll.status === 'CLOSED'
  const winnerCount   = Math.max(...poll.options.map((o) => o.voters.length))

  return (
    <div className={clsx('bg-white rounded-2xl border p-4 flex flex-col gap-3', isClosed ? 'border-gray-100' : 'border-gray-200')}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 leading-snug flex-1">{poll.question}</p>
        {isClosed ? (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium shrink-0">
            <Lock size={11} /> Fermé
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium shrink-0">Ouvert</span>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {poll.options.map((option) => {
          const pct         = totalVotes > 0 ? Math.round((option.voters.length / totalVotes) * 100) : 0
          const isMyVote    = option.voters.includes(currentUserId)
          const isWinner    = isClosed && option.voters.length === winnerCount && winnerCount > 0

          return (
            <button
              key={option.option_id}
              onClick={() => !isClosed && onVote(poll.id, option.option_id)}
              disabled={isClosed}
              className={clsx(
                'w-full text-left rounded-xl overflow-hidden border transition',
                isClosed ? 'cursor-default' : 'hover:border-indigo-300 active:scale-[0.99]',
                isMyVote   ? 'border-indigo-400 bg-indigo-50' :
                isWinner   ? 'border-amber-300 bg-amber-50'   :
                             'border-gray-200 bg-gray-50'
              )}
            >
              <div className="relative px-3 py-2.5">
                {/* Progress bar */}
                {totalVotes > 0 && (
                  <div
                    className={clsx(
                      'absolute inset-0 rounded-xl opacity-20',
                      isMyVote ? 'bg-indigo-500' : isWinner ? 'bg-amber-400' : 'bg-gray-400'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                )}
                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isMyVote && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                    {isWinner && !isMyVote && <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />}
                    <span className={clsx('text-sm font-medium', isMyVote ? 'text-indigo-700' : isWinner ? 'text-amber-700' : 'text-gray-700')}>
                      {option.text}
                    </span>
                  </div>
                  <span className={clsx('text-xs font-semibold shrink-0', isMyVote ? 'text-indigo-600' : 'text-gray-500')}>
                    {pct}% · {option.voters.length}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{totalVotes} vote{totalVotes > 1 ? 's' : ''}</span>
        <span>{timeAgo(poll.createdAt)}</span>
      </div>

      {!isClosed && !userVotedOn && (
        <p className="text-xs text-indigo-500 text-center">Voter vous rapporte <strong>+2 Karma</strong></p>
      )}
    </div>
  )
}

function PollsTab({ polls, currentUserId, onVote, onCreate, createLoading, error, setError }) {
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter]       = useState('open')

  const filtered = polls.filter((p) =>
    filter === 'all'    ? true :
    filter === 'open'   ? p.status === 'OPEN' :
                          p.status === 'CLOSED'
  )

  return (
    <>
      {showModal && (
        <CreatePollModal
          onClose={() => { setShowModal(false); setError(null) }}
          onCreate={onCreate}
          loading={createLoading}
          error={error}
        />
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {[{ value: 'open', label: 'Ouverts' }, { value: 'closed', label: 'Fermés' }, { value: 'all', label: 'Tous' }].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={clsx('px-3 py-1.5 rounded-xl text-xs font-medium transition',
                  filter === f.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >{f.label}</button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <Plus size={14} /> Créer
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <BarChart2 size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">Aucun sondage {filter === 'open' ? 'ouvert' : filter === 'closed' ? 'fermé' : ''}</p>
          </div>
        ) : (
          filtered.map((poll) => (
            <PollCard key={poll.id} poll={poll} currentUserId={currentUserId} onVote={onVote} />
          ))
        )}
      </div>
    </>
  )
}

// ─── KARMA ────────────────────────────────────────────────────────────────────

function KarmaTab({ members, currentUserId, onThank }) {
  const [thankingId, setThankingId] = useState(null)

  const handleThank = async (member) => {
    setThankingId(member.id)
    await onThank(member.id, member.name)
    setThankingId(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 text-xs">
        <Sparkles size={14} className="mt-0.5 shrink-0" />
        <span>Remerciez un colocataire pour une bonne action — il reçoit <strong>+3 Karma</strong>.</span>
      </div>

      {[...members]
        .filter((m) => m.id !== currentUserId)
        .sort((a, b) => b.karma_score - a.karma_score)
        .map((member) => (
          <div key={member.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <Avatar name={member.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Heart size={11} className="text-purple-400" />
                <span className="text-xs text-purple-600 font-medium">{member.karma_score} karma</span>
              </div>
            </div>
            <button
              onClick={() => handleThank(member)}
              disabled={thankingId === member.id}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-600 text-xs font-semibold hover:bg-purple-100 disabled:opacity-50 transition"
            >
              {thankingId === member.id
                ? <Loader2 size={13} className="animate-spin" />
                : <><Heart size={13} /> Remercier</>
              }
            </button>
          </div>
        ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { value: 'complaints', label: 'Plaintes',  Icon: MessageSquare },
  { value: 'polls',      label: 'Sondages',  Icon: BarChart2     },
  { value: 'karma',      label: 'Karma',     Icon: Heart         },
]

export default function Concordia() {
  const [activeTab, setActiveTab] = useState('complaints')

  const {
    loading,
    createComplaintLoading,
    createPollLoading,
    complaintError,
    setComplaintError,
    pollError,
    setPollError,
    karmaFeedback,
    members,
    complaints,
    polls,
    currentUserId,
    isAdmin,
    createComplaint,
    resolveComplaint,
    deleteComplaint,
    createPoll,
    votePoll,
    thankUser,
  } = useConcordia()

  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />)}
      </div>
    )
  }

  return (
    <>
      <KarmaToast feedback={karmaFeedback} />

      <div className="flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-4">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900">Concordia</h1>
            <p className="text-xs text-gray-400 mt-0.5">Social &amp; médiation</p>
          </div>

          {/* Tab bar */}
          <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all',
                  activeTab === tab.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <tab.Icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-4 pb-4">
          {activeTab === 'complaints' && (
            <ComplaintsTab
              complaints={complaints}
              members={members}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onResolve={resolveComplaint}
              onDelete={deleteComplaint}
              onCreate={createComplaint}
              createLoading={createComplaintLoading}
              error={complaintError}
              setError={setComplaintError}
            />
          )}
          {activeTab === 'polls' && (
            <PollsTab
              polls={polls}
              currentUserId={currentUserId}
              onVote={votePoll}
              onCreate={createPoll}
              createLoading={createPollLoading}
              error={pollError}
              setError={setPollError}
            />
          )}
          {activeTab === 'karma' && (
            <KarmaTab
              members={members}
              currentUserId={currentUserId}
              onThank={thankUser}
            />
          )}
        </div>
      </div>
    </>
  )
}
