import { RefreshCw, AlertTriangle } from 'lucide-react'
import { useDashboard } from '../../hooks/useDashboard'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAuthContext } from '../../context/AuthContext'
import DashboardHeader from './components/DashboardHeader'
import ScoreSummary from './components/ScoreSummary'
import UrgentAlertBanner from './components/UrgentAlertBanner'
import ChoresSummary from './components/ChoresSummary'
import UpcomingTasks from './components/UpcomingTasks'
import TopColocs from './components/TopColocs'
import RecentActivity from './components/RecentActivity'

function LoadingState() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3 px-4 pt-4">
      <span className="sr-only">Chargement en cours</span>
      {[1, 2, 3].map((i) => (
        <div key={i} aria-hidden="true" className="h-20 rounded-2xl bg-muted animate-pulse" />
      ))}
    </div>
  )
}

export default function Dashboard() {
  useDocumentTitle('Accueil')
  const { user } = useAuthContext()
  const {
    loading,
    error,
    refetch,
    currentUser,
    taskCounts,
    myTasks,
    primaryAlert,
    isSelfAssignedAlert,
    secondaryAlertCount,
    notifications,
    members,
    openComplaints,
    completeTask,
    completingTaskId,
  } = useDashboard()

  if (loading) return <LoadingState />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3 px-6 text-center">
        <AlertTriangle size={32} aria-hidden="true" className="text-destructive/70" />
        <p className="text-muted-foreground text-sm">Impossible de charger les données.</p>
        <button
          onClick={() => refetch()}
          className="text-primary text-sm font-medium flex items-center gap-1"
        >
          <RefreshCw size={14} aria-hidden="true" /> Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-10 pb-4">
      <DashboardHeader name={user?.name} />

      <ScoreSummary harmony={currentUser?.harmony_score} karma={currentUser?.karma_score} />

      {primaryAlert && (
        <UrgentAlertBanner
          ticket={primaryAlert}
          isSelfAssigned={isSelfAssignedAlert}
          extraCount={secondaryAlertCount}
        />
      )}

      <ChoresSummary counts={taskCounts} openComplaints={openComplaints} />

      <UpcomingTasks tasks={myTasks} onComplete={completeTask} completingId={completingTaskId} />

      <TopColocs members={members} />

      <RecentActivity notifications={notifications} />
    </div>
  )
}
