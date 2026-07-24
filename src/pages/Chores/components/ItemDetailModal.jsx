import { Clock, UserCheck } from 'lucide-react'
import { clsx } from 'clsx'
import Modal from '../../../components/Modal'
import Avatar from '../../../components/Avatar'
import SelectField from '../../../components/SelectField'
import { TICKET_STATUSES, TICKET_TRANSITIONS, categoryMeta, priorityMeta } from '../constants'
import { formatDate, isItemOverdue } from '../helpers'

const TASK_STATUS_LABEL = { TODO: 'À faire', IN_PROGRESS: 'En cours', DONE: 'Terminée' }

function Badge({ label, color }) {
  return <span className={clsx('px-2 py-0.5 rounded-lg text-xs font-medium', color)}>{label}</span>
}

export default function ItemDetailModal({ item, members, currentUserId, isAdmin, onClose, onSetStatus, onAssign }) {
  const assignee = members.find((m) => m.id === item.assigneeId)
  const overdue = isItemOverdue(item)

  const handleStatus = (status) => {
    onSetStatus(item, status)
    if (item.kind === 'task' ? status === 'DONE' : status !== item.status) onClose()
  }

  return (
    <Modal title={item.title} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {item.kind === 'ticket' ? (
          <div className="flex flex-wrap gap-2">
            <Badge label={priorityMeta(item.priority)?.label ?? item.priority} color={priorityMeta(item.priority)?.color ?? 'bg-muted text-muted-foreground'} />
            <Badge label={categoryMeta(item.category)?.label ?? item.category} color="bg-muted text-muted-foreground" />
            <Badge label={TICKET_STATUSES.find((s) => s.value === item.status)?.label ?? item.status} color={TICKET_STATUSES.find((s) => s.value === item.status)?.color ?? ''} />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Badge label={TASK_STATUS_LABEL[item.status]} color="bg-muted text-muted-foreground" />
            {overdue && item.status !== 'DONE' && <Badge label="En retard" color="bg-destructive/10 text-destructive" />}
          </div>
        )}

        {item.kind === 'ticket' && item.description && (
          <p className="text-sm text-foreground">{item.description}</p>
        )}

        {item.kind === 'task' && (
          <p className={clsx('flex items-center gap-1.5 text-sm', overdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
            <Clock size={14} aria-hidden="true" />
            {item.dueAt ? `Échéance : ${formatDate(item.dueAt)}` : 'Pas de date limite'}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-foreground">
          <UserCheck size={14} aria-hidden="true" className="text-muted-foreground" />
          {assignee ? (
            <span className="flex items-center gap-1.5">
              <Avatar name={assignee.name} size="xs" />
              {assignee.id === currentUserId ? 'Toi' : assignee.name}
            </span>
          ) : (
            'Non assigné'
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          {item.kind === 'task' ? (
            <>
              {item.status === 'TODO' && (
                <button type="button" onClick={() => handleStatus('IN_PROGRESS')} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition">
                  Démarrer
                </button>
              )}
              {item.status === 'IN_PROGRESS' && (
                <>
                  <button type="button" onClick={() => handleStatus('DONE')} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition">
                    Marquer comme terminée
                  </button>
                  <button type="button" onClick={() => handleStatus('TODO')} className="w-full py-2 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted transition">
                    Revenir à « à faire »
                  </button>
                </>
              )}
              {item.status === 'DONE' && <p className="text-sm text-secondary font-medium">Tâche terminée.</p>}
            </>
          ) : (
            (TICKET_TRANSITIONS[item.status] ?? []).map((status) => {
              const meta = TICKET_STATUSES.find((s) => s.value === status)
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatus(status)}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition"
                >
                  Marquer « {meta?.label ?? status} »
                </button>
              )
            })
          )}

          {item.kind === 'ticket' && isAdmin && (
            <SelectField
              label="Assigner à"
              value={item.assigneeId ?? ''}
              onChange={(userId) => onAssign(item.id, userId)}
              placeholder="-- Choisir --"
              options={members.map((m) => ({ value: m.id, label: m.name }))}
            />
          )}
        </div>
      </div>
    </Modal>
  )
}
