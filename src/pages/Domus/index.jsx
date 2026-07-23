import { useState } from 'react'
import {
  Users, Wrench, Plus, Star, Heart, ShieldCheck, User,
  Droplets, Zap, AirVent, Sofa, Wifi, HelpCircle,
  ChevronDown, AlertTriangle, Loader2, UserCheck, Copy, Check,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useDomus } from '../../hooks/useDomus'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import Avatar from '../../components/Avatar'
import Modal from '../../components/Modal'
import SelectField from '../../components/SelectField'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'PLUMBING',    label: 'Plomberie',      Icon: Droplets   },
  { value: 'ELECTRICITY', label: 'Électricité',    Icon: Zap        },
  { value: 'APPLIANCE',   label: 'Électroménager', Icon: AirVent    },
  { value: 'FURNITURE',   label: 'Mobilier',       Icon: Sofa       },
  { value: 'INTERNET',    label: 'Réseau',         Icon: Wifi       },
  { value: 'OTHER',       label: 'Autre',          Icon: HelpCircle },
]

const PRIORITIES = [
  { value: 'LOW',    label: 'Faible', color: 'bg-green-100 text-green-700'   },
  { value: 'MEDIUM', label: 'Moyen',  color: 'bg-yellow-100 text-yellow-700' },
  { value: 'HIGH',   label: 'Élevé',  color: 'bg-orange-100 text-orange-700' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-700'       },
]

const TICKET_STATUSES = [
  { value: 'OPEN',        label: 'Ouvert',   color: 'bg-gray-100 text-gray-600'   },
  { value: 'IN_PROGRESS', label: 'En cours', color: 'bg-blue-100 text-blue-700'   },
  { value: 'RESOLVED',    label: 'Résolu',   color: 'bg-green-100 text-green-700' },
  { value: 'CANCELLED',   label: 'Annulé',   color: 'bg-red-50 text-red-700'      },
]

const STATUS_TRANSITIONS = {
  OPEN:        ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['RESOLVED', 'CANCELLED'],
  RESOLVED:    [],
  CANCELLED:   [],
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Badge({ label, color }) {
  return <span className={clsx('px-2 py-0.5 rounded-lg text-xs font-medium', color)}>{label}</span>
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all',
            active === tab.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-700'
          )}
        >
          <tab.Icon size={15} />
          {tab.label}
          {tab.count > 0 && (
            <span className={clsx('text-xs rounded-full px-1.5 py-0.5 font-semibold',
              active === tab.value ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'
            )}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Create ticket modal ──────────────────────────────────────────────────────

function CreateTicketModal({ onClose, onCreate, loading, error }) {
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory]       = useState('PLUMBING')
  const [priority, setPriority]       = useState('LOW')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await onCreate({ title: title.trim(), description: description.trim(), category, priority })
    if (ok) onClose()
  }

  return (
    <Modal title="Nouveau ticket" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ticket-title" className="text-sm font-medium text-gray-700">Titre</label>
          <input
            id="ticket-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            placeholder="Ex: Robinet qui fuit sous l'évier"
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ticket-description" className="text-sm font-medium text-gray-700">
            Description <span className="text-gray-600 font-normal">(optionnel)</span>
          </label>
          <textarea
            id="ticket-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Détails supplémentaires..."
            rows={3}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Catégorie"
            value={category}
            onChange={setCategory}
            options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          />
          <SelectField
            label="Priorité"
            value={priority}
            onChange={setPriority}
            options={PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
          />
        </div>

        {priority === 'URGENT' && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>Priorité URGENT — une tâche sera automatiquement créée dans Labor.</span>
          </div>
        )}

        {error && (
          <p role="alert" className="text-xs text-red-600 flex items-center gap-1.5">
            <AlertTriangle size={13} /> {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 transition mt-1"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Créer le ticket</>}
        </button>
      </form>
    </Modal>
  )
}

// ─── Ticket card ──────────────────────────────────────────────────────────────

function TicketCard({ ticket, members, isAdmin, onUpdateStatus, onAssign }) {
  const [statusOpen, setStatusOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)

  const cat      = CATEGORIES.find((c) => c.value === ticket.category)
  const CatIcon  = cat?.Icon ?? HelpCircle
  const priority = PRIORITIES.find((p) => p.value === ticket.priority)
  const status   = TICKET_STATUSES.find((s) => s.value === ticket.status)
  const nextStatuses = STATUS_TRANSITIONS[ticket.status] ?? []
  const assignee = members.find((m) => m.id === ticket.assigned_to)
  const isDone   = ticket.status === 'RESOLVED' || ticket.status === 'CANCELLED'

  return (
    <div className={clsx('bg-white rounded-2xl border p-4 flex flex-col gap-3 transition', isDone ? 'border-gray-100 opacity-60' : 'border-gray-200')}>
      <div className="flex items-start gap-3">
        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', priority?.color ?? 'bg-gray-100 text-gray-500')}>
          <CatIcon size={17} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-snug">{ticket.title}</p>
          {ticket.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ticket.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge label={priority?.label ?? ticket.priority} color={priority?.color ?? 'bg-gray-100 text-gray-600'} />
        <Badge label={status?.label ?? ticket.status}     color={status?.color   ?? 'bg-gray-100 text-gray-600'} />
        <Badge label={cat?.label    ?? ticket.category}   color="bg-gray-100 text-gray-600" />
      </div>

      {assignee && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <UserCheck size={13} />
          <span>Assigné à <span className="font-medium text-gray-700">{assignee.name}</span></span>
        </div>
      )}

      {!isDone && (
        <div className="flex gap-2 pt-1 border-t border-gray-50">
          {nextStatuses.length > 0 && (
            <div className="relative flex-1">
              <button
                onClick={() => { setStatusOpen((s) => !s); setAssignOpen(false) }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                <span>Changer statut</span>
                <ChevronDown size={13} />
              </button>
              {statusOpen && (
                <div className="absolute bottom-full mb-1 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-20">
                  {nextStatuses.map((s) => {
                    const st = TICKET_STATUSES.find((x) => x.value === s)
                    return (
                      <button
                        key={s}
                        onClick={() => { onUpdateStatus(ticket.id, s); setStatusOpen(false) }}
                        className="w-full text-left px-3 py-2.5 text-xs font-medium hover:bg-gray-50 transition flex items-center gap-2"
                      >
                        <Badge label={st?.label ?? s} color={st?.color ?? ''} />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {isAdmin && (
            <div className="relative flex-1">
              <button
                onClick={() => { setAssignOpen((s) => !s); setStatusOpen(false) }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                <span>{assignee ? 'Réassigner' : 'Assigner'}</span>
                <ChevronDown size={13} />
              </button>
              {assignOpen && (
                <div className="absolute bottom-full mb-1 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-20">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { onAssign(ticket.id, m.id); setAssignOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-gray-50 transition"
                    >
                      <span className="font-semibold text-gray-800">{m.name}</span>
                      {m.role === 'ADMIN' && <span className="text-indigo-500">(Admin)</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Tab contents ─────────────────────────────────────────────────────────────

function MembersTab({ members, currentUserId }) {
  return (
    <div className="flex flex-col gap-2">
      {members.map((member) => (
        <div key={member.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="relative">
            <Avatar name={member.name} />
            {member.id === currentUserId && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
              {member.id === currentUserId && <span className="text-xs text-gray-600">(moi)</span>}
            </div>
            <p className="text-xs text-gray-600 truncate mt-0.5">{member.email}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {member.role === 'ADMIN' ? (
              <span className="flex items-center gap-1 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-lg font-medium">
                <ShieldCheck size={11} /> Admin
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium">
                <User size={11} /> Membre
              </span>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Star size={10} className="text-indigo-400" />{member.harmony_score}</span>
              <span className="flex items-center gap-1"><Heart size={10} className="text-purple-400" />{member.karma_score}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MaintenanceTab({ tickets, members, isAdmin, onUpdateStatus, onAssign }) {
  const [filter, setFilter] = useState('active')

  const filtered = tickets.filter((t) => {
    if (filter === 'active') return t.status === 'OPEN' || t.status === 'IN_PROGRESS'
    if (filter === 'done')   return t.status === 'RESOLVED' || t.status === 'CANCELLED'
    return true
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {[
          { value: 'active', label: 'Actifs'    },
          { value: 'done',   label: 'Terminés'  },
          { value: 'all',    label: 'Tous'      },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={clsx(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition',
              filter === f.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <Wrench size={28} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-600">
            Aucun ticket {filter === 'active' ? 'actif' : filter === 'done' ? 'terminé' : ''}
          </p>
        </div>
      ) : (
        filtered.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            members={members}
            isAdmin={isAdmin}
            onUpdateStatus={onUpdateStatus}
            onAssign={onAssign}
          />
        ))
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Domus() {
  useDocumentTitle('Domus')
  const [activeTab, setActiveTab]       = useState('members')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [inviteCopied, setInviteCopied] = useState(false)

  const {
    loading,
    createLoading,
    formError,
    setFormError,
    coloc,
    members,
    tickets,
    isAdmin,
    currentUserId,
    createTicket,
    updateStatus,
    assignTicket,
  } = useDomus()

  const activeTicketsCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length

  const tabs = [
    { value: 'members',     label: 'Membres',     Icon: Users,  count: members.length     },
    { value: 'maintenance', label: 'Maintenance', Icon: Wrench, count: activeTicketsCount  },
  ]

  const copyInviteCode = async () => {
    if (!coloc?.invite_code) return
    try {
      await navigator.clipboard.writeText(coloc.invite_code)
      setInviteCopied(true)
      setTimeout(() => setInviteCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />)}
      </div>
    )
  }

  return (
    <>
      {showCreateModal && (
        <CreateTicketModal
          onClose={() => { setShowCreateModal(false); setFormError(null) }}
          onCreate={createTicket}
          loading={createLoading}
          error={formError}
        />
      )}

      <div className="flex flex-col">
        <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Domus</h1>
              <p className="text-xs text-gray-600 mt-0.5">Habitat &amp; maintenance</p>
            </div>
            {activeTab === 'maintenance' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
              >
                <Plus size={16} /> Signaler
              </button>
            )}
          </div>
          {coloc?.invite_code && (
            <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Code d&apos;invitation</span>
                <button
                  type="button"
                  onClick={copyInviteCode}
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-indigo-100 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition"
                >
                  {inviteCopied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  {inviteCopied ? 'Copié !' : 'Copier'}
                </button>
              </div>
              <code className="font-mono text-sm font-bold text-gray-900 tracking-tight break-all">
                {coloc.invite_code}
              </code>
              <p className="text-xs text-indigo-900/70 leading-snug">
                Envoyez ce code à vos colocataires pour qu&apos;ils rejoignent la colocation depuis l&apos;onboarding.
              </p>
            </div>
          )}
          <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>

        <div className="px-4 pt-4 pb-4">
          {activeTab === 'members' ? (
            <MembersTab members={members} currentUserId={currentUserId} />
          ) : (
            <MaintenanceTab
              tickets={tickets}
              members={members}
              isAdmin={isAdmin}
              onUpdateStatus={updateStatus}
              onAssign={assignTicket}
            />
          )}
        </div>
      </div>
    </>
  )
}
