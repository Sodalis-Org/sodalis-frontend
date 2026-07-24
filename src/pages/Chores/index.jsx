import { useMemo, useState } from 'react'
import { Plus, ShieldAlert, Repeat } from 'lucide-react'
import { clsx } from 'clsx'
import { useChores } from '../../hooks/useChores'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useSetPageAction } from '../../context/PageActionContext'
import QueryErrorState from '../../components/QueryErrorState'
import StatusFilterPills from './components/StatusFilterPills'
import HarmonyToast from './components/HarmonyToast'
import UrgentTicketCard from './components/UrgentTicketCard'
import ChoreRow from './components/ChoreRow'
import CreateChoreModal from './components/CreateChoreModal'
import ItemDetailModal from './components/ItemDetailModal'

const TABS = [
  { value: 'all', label: 'Tout le monde' },
  { value: 'mine', label: 'Mes tâches' },
]

const isPinnedUrgent = (item) => item.kind === 'ticket' && item.priority === 'URGENT' && item.bucket !== 'DONE'

export default function Chores() {
  useDocumentTitle('Corvées')

  const [activeTab, setActiveTab] = useState('all')
  const [activeBucket, setActiveBucket] = useState('TODO')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [detailItem, setDetailItem] = useState(null)

  const {
    loading,
    error,
    refetch,
    createLoading,
    formError,
    setFormError,
    items,
    members,
    currentUserId,
    isAdmin,
    createTask,
    createTicket,
    advanceItem,
    setItemStatus,
    assignTicket,
    lastCompleted,
  } = useChores()

  const createButton = useMemo(() => (
    <button
      type="button"
      onClick={() => setShowCreateModal(true)}
      aria-label="Ajouter une corvée ou un ticket"
      className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition"
    >
      <Plus size={18} aria-hidden="true" />
    </button>
  ), [])
  useSetPageAction(createButton)

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="flex flex-col gap-3 px-4 pt-4">
        <span className="sr-only">Chargement en cours</span>
        {[1, 2, 3].map((i) => <div key={i} aria-hidden="true" className="h-20 rounded-2xl bg-muted animate-pulse" />)}
      </div>
    )
  }

  if (error) {
    return <QueryErrorState onRetry={() => refetch()} />
  }

  const scopedItems = activeTab === 'mine' ? items.filter((i) => i.assigneeId === currentUserId) : items
  const urgentItems = scopedItems.filter(isPinnedUrgent)
  const weeklyItems = scopedItems.filter((i) => !isPinnedUrgent(i))
  const counts = {
    TODO: weeklyItems.filter((i) => i.bucket === 'TODO').length,
    IN_PROGRESS: weeklyItems.filter((i) => i.bucket === 'IN_PROGRESS').length,
    DONE: weeklyItems.filter((i) => i.bucket === 'DONE').length,
  }
  const displayedItems = weeklyItems.filter((i) => i.bucket === activeBucket)

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <HarmonyToast completed={lastCompleted} />

      {showCreateModal && (
        <CreateChoreModal
          onClose={() => { setShowCreateModal(false); setFormError(null) }}
          onCreateTask={createTask}
          onCreateTicket={createTicket}
          loading={createLoading}
          error={formError}
          members={members}
        />
      )}

      {detailItem && (
        <ItemDetailModal
          item={detailItem}
          members={members}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onClose={() => setDetailItem(null)}
          onSetStatus={setItemStatus}
          onAssign={assignTicket}
        />
      )}

      <div className="px-4 pt-10 pb-4 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-foreground pr-24">Corvées &amp; Maintenance</h1>

        <div className="flex bg-muted p-1 rounded-2xl gap-1" role="tablist" aria-label="Portée">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={clsx(
                'flex-1 py-2 rounded-xl text-sm font-semibold transition-all',
                activeTab === tab.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <StatusFilterPills active={activeBucket} onChange={setActiveBucket} counts={counts} />
      </div>

      <div className="px-4 pb-6 flex flex-col gap-6">
        {urgentItems.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} aria-hidden="true" className="text-accent-foreground" />
              <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">Urgences maintenance</h2>
            </div>
            {urgentItems.map((ticket) => (
              <UrgentTicketCard
                key={ticket.key}
                ticket={ticket}
                members={members}
                currentUserId={currentUserId}
                onOpen={setDetailItem}
              />
            ))}
          </section>
        )}

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Repeat size={16} aria-hidden="true" className="text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">Corvées hebdomadaires</h2>
          </div>

          {displayedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Rien à afficher ici.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {displayedItems.map((item) => (
                <ChoreRow
                  key={item.key}
                  item={item}
                  members={members}
                  currentUserId={currentUserId}
                  onAdvance={advanceItem}
                  onOpen={setDetailItem}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
