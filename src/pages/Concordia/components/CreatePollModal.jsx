import { useId, useState } from 'react'
import { BarChart2, Plus, X, AlertTriangle } from 'lucide-react'
import Modal from '../../../components/Modal'
import LoadingSpinner from '../../../components/LoadingSpinner'

export default function CreatePollModal({ onClose, onCreate, loading, error }) {
  const optionLabelId = useId()
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
          <label htmlFor="poll-question" className="text-sm font-medium text-foreground">Question</label>
          <input
            id="poll-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            placeholder="Quel jour pour le grand ménage ?"
            className="px-3.5 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Options <span className="text-muted-foreground font-normal">(2–6)</span></span>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <label htmlFor={`${optionLabelId}-${i}`} className="sr-only">{`Option ${i + 1}`}</label>
              <input
                id={`${optionLabelId}-${i}`}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                required
                placeholder={`Option ${i + 1}`}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  aria-label={`Supprimer l'option ${i + 1}`}
                  className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition shrink-0"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition"
            >
              <Plus size={13} aria-hidden="true" /> Ajouter une option
            </button>
          )}
        </div>

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
          {loading ? <LoadingSpinner size={16} /> : <><BarChart2 size={15} aria-hidden="true" /> Créer le sondage</>}
        </button>
      </form>
    </Modal>
  )
}
