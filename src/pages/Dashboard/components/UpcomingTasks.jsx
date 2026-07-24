import { CheckSquare, Check } from 'lucide-react'
import { clsx } from 'clsx'
import { formatDueDate } from '../../../lib/time'

const STATUS_LABELS = { TODO: 'À faire', IN_PROGRESS: 'En cours' }
const STATUS_COLORS = { TODO: 'bg-muted text-muted-foreground', IN_PROGRESS: 'bg-primary/10 text-primary' }

function isOverdue(task) {
  return Boolean(task.due_at) && new Date(task.due_at) < new Date()
}

function sortUpcoming(tasks) {
  return [...tasks].sort((a, b) => {
    const overdueDiff = Number(isOverdue(b)) - Number(isOverdue(a))
    if (overdueDiff !== 0) return overdueDiff
    if (!a.due_at) return 1
    if (!b.due_at) return -1
    return new Date(a.due_at) - new Date(b.due_at)
  })
}

export default function UpcomingTasks({ tasks, onComplete, completingId }) {
  const upcoming = sortUpcoming(tasks.filter((t) => t.status !== 'DONE')).slice(0, 3)

  return (
    <section>
      <h2 className="text-base font-bold text-foreground mb-3">Ce qui t&apos;attend</h2>

      {upcoming.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-sm p-6 text-center">
          <CheckSquare size={28} aria-hidden="true" className="mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Aucune tâche en attente</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {upcoming.map((task) => {
            const overdue = isOverdue(task)
            return (
              <div key={task.id} className="bg-card rounded-2xl shadow-sm p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckSquare size={18} aria-hidden="true" className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {overdue ? (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive">En retard</span>
                    ) : (
                      <span className={clsx('px-2 py-0.5 rounded-lg text-xs font-medium', STATUS_COLORS[task.status])}>
                        {STATUS_LABELS[task.status]}
                      </span>
                    )}
                    {task.due_at && <span className="text-xs text-muted-foreground">{formatDueDate(task.due_at)}</span>}
                  </div>
                </div>
                <button
                  onClick={() => onComplete(task.id)}
                  disabled={completingId === task.id}
                  aria-label={`Marquer « ${task.title} » comme terminée`}
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-secondary/40 hover:text-secondary hover:bg-secondary/10 transition disabled:opacity-50 shrink-0"
                >
                  <Check size={16} aria-hidden="true" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
