import { useQuery } from '@apollo/client'
import { useAuthContext } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { GET_COLOC_DASHBOARD, GET_NOTIFICATIONS } from '../graphql/dashboard'
import { GET_MAINTENANCE_TICKETS } from '../graphql/maintenance'

export function useDashboard() {
  const { user, loading: authLoading } = useAuthContext()
  const colocId = user?.coloc_id
  const { notifications: liveNotifications } = useSocket()

  const {
    data: dashData,
    loading: dashLoading,
    error: dashError,
    refetch: refetchDash,
  } = useQuery(GET_COLOC_DASHBOARD, {
    variables: { colocId },
    skip: !colocId,
    pollInterval: 30000,
  })

  const {
    data: notifData,
    loading: notifLoading,
  } = useQuery(GET_NOTIFICATIONS, {
    variables: { colocId, page: 1, limit: 10 },
    skip: !colocId,
  })

  const {
    data: maintenanceData,
    loading: maintenanceLoading,
  } = useQuery(GET_MAINTENANCE_TICKETS, {
    variables: { colocId },
    skip: !colocId,
  })

  const dashboard = dashData?.getColocDashboard ?? null
  const currentUser = dashboard?.users.find((u) => u.id === user?.id) ?? null

  const taskCounts = {
    todo: dashboard?.tasks.filter((t) => t.status === 'TODO').length ?? 0,
    inProgress: dashboard?.tasks.filter((t) => t.status === 'IN_PROGRESS').length ?? 0,
    done: dashboard?.tasks.filter((t) => t.status === 'DONE').length ?? 0,
  }

  const myTasks = dashboard?.tasks.filter((t) => t.assignee_id === user?.id) ?? []

  const alertTickets = (maintenanceData?.maintenanceTickets ?? []).filter(
    (t) => (t.priority === 'HIGH' || t.priority === 'URGENT') && t.status !== 'RESOLVED' && t.status !== 'CANCELLED'
  )

  const historicalNotifications = notifData?.notifications.data ?? []
  const seenIds = new Set(liveNotifications.map((n) => n.id))
  const mergedNotifications = [
    ...liveNotifications,
    ...historicalNotifications.filter((n) => !seenIds.has(n.id)),
  ].slice(0, 20)

  return {
    loading: authLoading || dashLoading || notifLoading || maintenanceLoading,
    error: dashError,
    refetch: refetchDash,
    dashboard,
    currentUser,
    taskCounts,
    myTasks,
    alertTickets,
    notifications: mergedNotifications,
    members: dashboard?.users ?? [],
    openComplaints: dashboard?.open_complaints ?? 0,
  }
}
