import { renderHook, act, waitFor } from '@testing-library/react'
import { GET_USERS_BY_COLOC } from '../../src/graphql/users'
import {
  GET_MAINTENANCE_TICKETS,
  CREATE_MAINTENANCE_TICKET,
  UPDATE_TICKET_STATUS,
  ASSIGN_TICKET,
} from '../../src/graphql/maintenance'
import { GET_MY_COLOC } from '../../src/graphql/auth'
import { useDomus } from '../../src/hooks/useDomus'
import { setAuthUser, resetAuthUser, makeWrapper } from '../utils.jsx'

const colocId = 'c1'

function baseMocks() {
  return [
    {
      request: { query: GET_USERS_BY_COLOC, variables: { colocId } },
      result: { data: { usersByColoc: [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }] } },
    },
    {
      request: { query: GET_MAINTENANCE_TICKETS, variables: { colocId } },
      result: { data: { maintenanceTickets: [{ id: 1, title: 'Fuite', status: 'OPEN', priority: 'HIGH' }] } },
    },
    {
      request: { query: GET_MY_COLOC },
      result: { data: { myColoc: { id: colocId, name: 'Maison', invite_code: 'XYZ' } } },
    },
  ]
}

describe('useDomus', () => {
  beforeEach(() => {
    resetAuthUser()
    setAuthUser({ id: 'u1', coloc_id: colocId, role: 'ADMIN' })
  })

  it('exposes members, tickets and coloc once queries resolve', async () => {
    const { result } = renderHook(() => useDomus(), { wrapper: makeWrapper(baseMocks()) })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.members).toHaveLength(2)
    expect(result.current.tickets).toHaveLength(1)
    expect(result.current.coloc).toEqual({ id: colocId, name: 'Maison', invite_code: 'XYZ' })
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.currentUserId).toBe('u1')
  })

  it('createTicket returns true and clears formError on success', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: {
          query: CREATE_MAINTENANCE_TICKET,
          variables: { title: 'Fuite', description: undefined, category: 'PLUMBING', priority: 'HIGH', coloc_id: colocId },
        },
        result: { data: { createMaintenanceTicket: { id: 2 } } },
      },
    ]
    const { result } = renderHook(() => useDomus(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok
    await act(async () => {
      ok = await result.current.createTicket({ title: 'Fuite', description: '', category: 'PLUMBING', priority: 'HIGH' })
    })

    expect(ok).toBe(true)
    expect(result.current.formError).toBeNull()
  })

  it('createTicket sets formError on failure', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: {
          query: CREATE_MAINTENANCE_TICKET,
          variables: { title: '', description: undefined, category: 'OTHER', priority: 'LOW', coloc_id: colocId },
        },
        error: new Error('Network error'),
      },
    ]
    const { result } = renderHook(() => useDomus(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok
    await act(async () => {
      ok = await result.current.createTicket({ title: '', description: '', category: 'OTHER', priority: 'LOW' })
    })

    expect(ok).toBe(false)
    expect(result.current.formError).toBe('Network error')
  })

  it('updateStatus and assignTicket call their mutations without throwing', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: UPDATE_TICKET_STATUS, variables: { id: '1', status: 'RESOLVED' } },
        result: { data: { updateTicketStatus: { id: 1, status: 'RESOLVED' } } },
      },
      {
        request: { query: ASSIGN_TICKET, variables: { id: '1', assigned_to: 'u2' } },
        result: { data: { assignTicket: { id: 1, assigned_to: 'u2' } } },
      },
    ]
    const { result } = renderHook(() => useDomus(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.updateStatus(1, 'RESOLVED')
    })
    await act(async () => {
      await result.current.assignTicket(1, 'u2')
    })
  })
})
