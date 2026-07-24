import { renderHook, act, waitFor } from '@testing-library/react'
import { GET_TASKS_BY_COLOC, CREATE_TASK, UPDATE_TASK_STATUS } from '../../src/graphql/tasks'
import {
  GET_MAINTENANCE_TICKETS,
  CREATE_MAINTENANCE_TICKET,
  UPDATE_TICKET_STATUS,
  ASSIGN_TICKET,
} from '../../src/graphql/maintenance'
import { GET_USERS_BY_COLOC } from '../../src/graphql/users'
import { useChores } from '../../src/hooks/useChores'
import { setAuthUser, resetAuthUser, makeWrapper } from '../utils.jsx'

const colocId = 'c1'

const tasks = [
  { id: 't1', title: 'Vaisselle', status: 'TODO', assignee_id: 'u1', due_at: null },
  { id: 't2', title: 'Poubelles', status: 'IN_PROGRESS', assignee_id: 'u1', due_at: '2999-01-01' },
]

const tickets = [
  { id: 1, title: 'Fuite', status: 'OPEN', priority: 'URGENT', category: 'PLUMBING', assigned_to: 'u1' },
  { id: 2, title: 'Ampoule', status: 'OPEN', priority: 'MEDIUM', category: 'ELECTRICITY', assigned_to: 'u2' },
]

function baseMocks() {
  return [
    { request: { query: GET_TASKS_BY_COLOC, variables: { colocId } }, result: { data: { tasksByColoc: tasks } } },
    { request: { query: GET_MAINTENANCE_TICKETS, variables: { colocId } }, result: { data: { maintenanceTickets: tickets } } },
    { request: { query: GET_USERS_BY_COLOC, variables: { colocId } }, result: { data: { usersByColoc: [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }] } } },
  ]
}

describe('useChores', () => {
  beforeEach(() => {
    resetAuthUser()
    setAuthUser({ id: 'u1', coloc_id: colocId, role: 'ADMIN' })
  })

  it('merges tasks and tickets into a unified item list, flagging urgent tickets', async () => {
    const { result } = renderHook(() => useChores(), { wrapper: makeWrapper(baseMocks()) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.items).toHaveLength(4)
    expect(result.current.urgentItems).toHaveLength(1)
    expect(result.current.urgentItems[0].title).toBe('Fuite')
  })

  it('createTask returns true on success', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: CREATE_TASK, variables: { title: 'Repasser', assignee_id: 'u1', coloc_id: colocId, due_at: undefined } },
        result: { data: { createTask: { id: 't3' } } },
      },
    ]
    const { result } = renderHook(() => useChores(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok
    await act(async () => {
      ok = await result.current.createTask({ title: 'Repasser', assignee_id: 'u1', due_at: '' })
    })
    expect(ok).toBe(true)
  })

  it('createTicket sets formError on failure', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: CREATE_MAINTENANCE_TICKET, variables: { title: '', description: undefined, category: 'OTHER', priority: 'LOW', coloc_id: colocId } },
        error: new Error('Network error'),
      },
    ]
    const { result } = renderHook(() => useChores(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok
    await act(async () => {
      ok = await result.current.createTicket({ title: '', description: '', category: 'OTHER', priority: 'LOW' })
    })
    expect(ok).toBe(false)
    expect(result.current.formError).toBe('Network error')
  })

  it('advanceItem moves a task from TODO to IN_PROGRESS', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: UPDATE_TASK_STATUS, variables: { id: 't1', status: 'IN_PROGRESS' } },
        result: { data: { updateTaskStatus: { id: 't1', status: 'IN_PROGRESS' } } },
      },
    ]
    const { result } = renderHook(() => useChores(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    const task = result.current.items.find((i) => i.kind === 'task' && i.id === 't1')
    await act(async () => {
      await result.current.advanceItem(task)
    })
    expect(result.current.lastCompleted).toBeNull()
  })

  it('advanceItem moves a ticket from OPEN to IN_PROGRESS', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: UPDATE_TICKET_STATUS, variables: { id: '1', status: 'IN_PROGRESS' } },
        result: { data: { updateTicketStatus: { id: 1, status: 'IN_PROGRESS' } } },
      },
    ]
    const { result } = renderHook(() => useChores(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    const ticket = result.current.items.find((i) => i.kind === 'ticket' && i.id === 1)
    await act(async () => {
      await result.current.advanceItem(ticket)
    })
  })

  it('setItemStatus completing a task on time sets lastCompleted', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: UPDATE_TASK_STATUS, variables: { id: 't2', status: 'DONE' } },
        result: { data: { updateTaskStatus: { id: 't2', status: 'DONE' } } },
      },
    ]
    const { result } = renderHook(() => useChores(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    const task = result.current.items.find((i) => i.kind === 'task' && i.id === 't2')
    await act(async () => {
      await result.current.setItemStatus(task, 'DONE')
    })
    expect(result.current.lastCompleted).toMatchObject({ title: 'Poubelles', points: 10, isOnTime: true })
  })

  it('assignTicket calls the mutation without throwing', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: ASSIGN_TICKET, variables: { id: '2', assigned_to: 'u1' } },
        result: { data: { assignTicket: { id: 2, assigned_to: 'u1' } } },
      },
    ]
    const { result } = renderHook(() => useChores(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.assignTicket(2, 'u1')
    })
  })
})
