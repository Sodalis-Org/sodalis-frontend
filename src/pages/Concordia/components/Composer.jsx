import { useState } from 'react'
import { ShieldAlert, BarChart2, Plus, Heart } from 'lucide-react'
import Modal from '../../../components/Modal'

const QUICK_ADD_ACTIONS = [
  { key: 'complaint', label: 'Déposer un signalement', Icon: ShieldAlert, style: 'bg-primary/10 text-primary' },
  { key: 'poll',      label: 'Lancer un sondage',       Icon: BarChart2,  style: 'bg-muted text-muted-foreground' },
  { key: 'karma',     label: 'Remercier un colocataire', Icon: Heart,      style: 'bg-accent/20 text-accent-foreground' },
]

export default function Composer({ onOpenComplaint, onOpenPoll, onOpenKarma }) {
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const handleAction = (key) => {
    setShowQuickAdd(false)
    if (key === 'complaint') onOpenComplaint()
    if (key === 'poll') onOpenPoll()
    if (key === 'karma') onOpenKarma()
  }

  return (
    <>
      {showQuickAdd && (
        <Modal title="Ajouter une interaction" onClose={() => setShowQuickAdd(false)}>
          <div className="flex flex-col gap-2">
            {QUICK_ADD_ACTIONS.map(({ key, label, Icon, style }) => (
              <button
                key={key}
                onClick={() => handleAction(key)}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/70 transition text-left"
              >
                <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${style}`}>
                  <Icon size={16} aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}

      <div className="fixed bottom-16 inset-x-0 z-40 flex justify-center pointer-events-none">
        <div className="w-full max-w-lg px-4 pb-3 pointer-events-auto">
          <div className="flex items-center gap-2 bg-card border border-border rounded-full shadow-lg p-1.5 pl-4">
            <label htmlFor="concordia-composer-input" className="sr-only">Ajouter une interaction</label>
            <input
              id="concordia-composer-input"
              type="text"
              disabled
              placeholder="Ajouter une interaction..."
              title="La messagerie libre arrive bientôt"
              className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              onClick={onOpenComplaint}
              aria-label="Déposer un signalement"
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-primary transition shrink-0"
            >
              <ShieldAlert size={18} aria-hidden="true" />
            </button>
            <button
              onClick={onOpenPoll}
              aria-label="Lancer un sondage"
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0"
            >
              <BarChart2 size={18} aria-hidden="true" />
            </button>
            <button
              onClick={() => setShowQuickAdd(true)}
              aria-label="Ajouter une interaction"
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition shrink-0"
            >
              <Plus size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
