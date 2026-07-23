import { renderHook, waitFor } from '@testing-library/react'
import { GET_COLOC_DASHBOARD, GET_NOTIFICATIONS } from '../../src/graphql/dashboard'
import { GET_MAINTENANCE_TICKETS } from '../../src/graphql/maintenance'
import { useDashboard } from '../../src/hooks/useDashboard'
import { setAuthUser, makeWrapper } from '../utils.jsx'

const colocId = 'c1'

const dashboard = {
  users: [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }],
  tasks: [
    { id: 't1', status: 'TODO', assignee_id: 'u1' },
    { id: 't2', status: 'IN_PROGRESS', assignee_id: 'u1' },
    { id: 't3', status: 'DONE', assignee_id: 'u2' },
  ],
  open_complaints: 2,
}

function baseMocks() {
  return [
    {
      request: { query: GET_COLOC_DASHBOARD, variables: { colocId } },
      result: { data: { getColocDashboard: dashboard } },
    },
    {
      request: { query: GET_NOTIFICATIONS, variables: { colocId, page: 1, limit: 10 } },
      result: { data: { notifications: { data: [{ id: 'n1', message: 'Bienvenue' }] } } },
    },
    {
      request: { query: GET_MAINTENANCE_TICKETS, variables: { colocId } },
      result: {
        data: {
          maintenanceTickets: [
            { id: 1, priority: 'URGENT', status: 'OPEN' },
            { id: 2, priority: 'LOW', status: 'OPEN' },
            { id: 3, priority: 'HIGH', status: 'RESOLVED' },
          ],
        },
      },
    },
  ]
}

describe('useDashboard', () => {
  beforeEach(() => {
    localStorage.clear()
    setAuthUser({ id: 'u1', coloc_id: colocId })
  })

  it('derives task counts, my tasks, alert tickets and merged notifications', async () => {
    const { result, unmount } = renderHook(() => useDashboard(), { wrapper: makeWrapper(baseMocks()) })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.taskCounts).toEqual({ todo: 1, inProgress: 1, done: 1 })
    expect(result.current.myTasks).toHaveLength(2)
    expect(result.current.members).toHaveLength(2)
    expect(result.current.openComplaints).toBe(2)
    expect(result.current.currentUser).toEqual({ id: 'u1', name: 'Alice' })

    expect(result.current.alertTickets).toHaveLength(1)
    expect(result.current.alertTickets[0].id).toBe(1)

    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.notifications[0]).toMatchObject({ id: 'n1', message: 'Bienvenue' })

    unmount()
  })
})
