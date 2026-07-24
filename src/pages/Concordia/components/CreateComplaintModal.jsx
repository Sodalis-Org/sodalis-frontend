import { useState } from 'react'
import { MessageSquare, EyeOff, AlertTriangle } from 'lucide-react'
import { clsx } from 'clsx'
import Modal from '../../../components/Modal'
import SelectField from '../../../components/SelectField'
import LoadingSpinner from '../../../components/LoadingSpinner'

export default function CreateComplaintModal({ onClose, onCreate, loading, error, members, currentUserId }) {
  const [message, setMessage]         = useState('')
  const [targetId, setTargetId]       = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await onCreate({ message: message.trim(), target_id: targetId || null, is_anonymous: isAnonymous })
    if (ok) onClose()
  }

  const others = members.filter((m) => m.id !== currentUserId)

  return (
    <Modal title="Déposer un signalement" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="complaint-message" className="text-sm font-medium text-foreground">Message</label>
          <textarea
            id="complaint-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            placeholder="Décrivez le problème..."
            className="px-3.5 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring transition"
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
            isAnonymous ? 'bg-foreground border-foreground text-background' : 'bg-muted border-border text-foreground hover:bg-muted/70'
          )}
        >
          <EyeOff size={16} aria-hidden="true" className="shrink-0" />
          <div className="flex flex-col items-start">
            <span>Signalement anonyme</span>
            <span className={clsx('text-xs font-normal', isAnonymous ? 'text-background/70' : 'text-muted-foreground')}>
              {isAnonymous ? 'Votre identité sera masquée définitivement' : 'Votre nom sera visible'}
            </span>
          </div>
          <div className={clsx('ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0', isAnonymous ? 'bg-background border-background' : 'border-border')}>
            {isAnonymous && <div className="w-2.5 h-2.5 rounded-full bg-foreground" />}
          </div>
        </button>

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
          {loading ? <LoadingSpinner size={16} /> : <><MessageSquare size={15} aria-hidden="true" /> Déposer le signalement</>}
        </button>
      </form>
    </Modal>
  )
}
