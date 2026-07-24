import { useState } from 'react'
import { Plus, CalendarDays, AlertTriangle, Star } from 'lucide-react'
import { clsx } from 'clsx'
import Modal from '../../../components/Modal'
import SelectField from '../../../components/SelectField'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { CATEGORIES, PRIORITIES } from '../constants'

const TYPES = [
  { value: 'task', label: 'Corvée' },
  { value: 'ticket', label: 'Ticket maintenance' },
]

export default function CreateChoreModal({ onClose, onCreateTask, onCreateTicket, loading, error, members }) {
  const [type, setType] = useState('task')
  const [title, setTitle] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('PLUMBING')
  const [priority, setPriority] = useState('LOW')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok =
      type === 'task'
        ? await onCreateTask({ title: title.trim(), assignee_id: assigneeId, due_at: dueAt ? new Date(dueAt).toISOString() : null })
        : await onCreateTicket({ title: title.trim(), description: description.trim(), category, priority })
    if (ok) onClose()
  }

  return (
    <Modal title="Nouvel élément" onClose={onClose}>
      <div className="flex bg-muted p-1 rounded-2xl gap-1 mb-1" role="tablist" aria-label="Type d'élément">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={type === t.value}
            onClick={() => setType(t.value)}
            className={clsx(
              'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
              type === t.value ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="chore-title" className="text-sm font-medium text-foreground">Titre</label>
          <input
            id="chore-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            placeholder={type === 'task' ? "Ex: Passer l'aspirateur au salon" : "Ex: Robinet qui fuit sous l'évier"}
            className="px-3.5 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        {type === 'task' ? (
          <>
            <SelectField
              label="Assigner à"
              value={assigneeId}
              onChange={setAssigneeId}
              required
              placeholder="-- Choisir --"
              options={members.map((m) => ({ value: m.id, label: m.name }))}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="chore-due-at" className="text-sm font-medium text-foreground">
                Date limite <span className="text-muted-foreground font-normal">(optionnel)</span>
              </label>
              <div className="relative">
                <input
                  id="chore-due-at"
                  type="date"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                <CalendarDays size={14} aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs">
              <Star size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span>Terminer avant la date limite rapporte <strong>+10 Harmony</strong>. Après : +2.</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="chore-description" className="text-sm font-medium text-foreground">
                Description <span className="text-muted-foreground font-normal">(optionnel)</span>
              </label>
              <textarea
                id="chore-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails supplémentaires..."
                rows={3}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Catégorie" value={category} onChange={setCategory} options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))} />
              <SelectField label="Priorité" value={priority} onChange={setPriority} options={PRIORITIES.map((p) => ({ value: p.value, label: p.label }))} />
            </div>
            {priority === 'URGENT' && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                <AlertTriangle size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span>Priorité urgente — une corvée sera automatiquement créée et t&apos;y sera assignée.</span>
              </div>
            )}
          </>
        )}

        {error && (
          <p role="alert" className="text-xs text-destructive flex items-center gap-1.5">
            <AlertTriangle size={13} aria-hidden="true" /> {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition mt-1"
        >
          {loading ? <LoadingSpinner size={16} /> : <><Plus size={16} aria-hidden="true" /> Créer</>}
        </button>
      </form>
    </Modal>
  )
}
