import { renderHook, act, waitFor } from '@testing-library/react'
import { GET_TASKS_BY_COLOC, CREATE_TASK, UPDATE_TASK_STATUS } from '../../src/graphql/tasks'
import { GET_USERS_BY_COLOC } from '../../src/graphql/users'
import { useLabor } from '../../src/hooks/useLabor'
import { setAuthUser, makeWrapper } from '../utils.jsx'

const colocId = 'c1'

const tasks = [
  { id: 't1', title: 'Vaisselle', status: 'TODO', assignee_id: 'u1', due_at: null },
  { id: 't2', title: 'Poubelles', status: 'IN_PROGRESS', assignee_id: 'u1', due_at: '2999-01-01' },
  { id: 't3', title: 'Aspirateur', status: 'DONE', assignee_id: 'u2', due_at: null },
]

function baseMocks() {
  return [
    {
      request: { query: GET_TASKS_BY_COLOC, variables: { colocId } },
      result: { data: { tasksByColoc: tasks } },
    },
    {
      request: { query: GET_USERS_BY_COLOC, variables: { colocId } },
      result: { data: { usersByColoc: [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }] } },
    },
  ]
}

describe('useLabor', () => {
  beforeEach(() => {
    localStorage.clear()
    setAuthUser({ id: 'u1', coloc_id: colocId })
  })

  it('groups tasks by status', async () => {
    const { result } = renderHook(() => useLabor(), { wrapper: makeWrapper(baseMocks()) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.grouped.TODO).toHaveLength(1)
    expect(result.current.grouped.IN_PROGRESS).toHaveLength(1)
    expect(result.current.grouped.DONE).toHaveLength(1)
    expect(result.current.currentUserId).toBe('u1')
  })

  it('createTask returns true on success', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: {
          query: CREATE_TASK,
          variables: { title: 'Repasser', assignee_id: 'u1', coloc_id: colocId, due_at: undefined },
        },
        result: { data: { createTask: { id: 't4' } } },
      },
    ]
    const { result } = renderHook(() => useLabor(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok
    await act(async () => {
      ok = await result.current.createTask({ title: 'Repasser', assignee_id: 'u1', due_at: '' })
    })

    expect(ok).toBe(true)
    expect(result.current.formError).toBeNull()
  })

  it('createTask sets formError on failure', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: {
          query: CREATE_TASK,
          variables: { title: '', assignee_id: 'u1', coloc_id: colocId, due_at: undefined },
        },
        error: new Error('Network error'),
      },
    ]
    const { result } = renderHook(() => useLabor(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok
    await act(async () => {
      ok = await result.current.createTask({ title: '', assignee_id: 'u1', due_at: '' })
    })

    expect(ok).toBe(false)
    expect(result.current.formError).toBe('Network error')
  })

  it('advanceStatus moves TODO to IN_PROGRESS', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: UPDATE_TASK_STATUS, variables: { id: 't1', status: 'IN_PROGRESS' } },
        result: { data: { updateTaskStatus: { id: 't1', status: 'IN_PROGRESS' } } },
      },
    ]
    const { result } = renderHook(() => useLabor(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.advanceStatus(tasks[0])
    })

    expect(result.current.lastCompleted).toBeNull()
  })

  it('advanceStatus to DONE sets lastCompleted with on-time points', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: UPDATE_TASK_STATUS, variables: { id: 't2', status: 'DONE' } },
        result: { data: { updateTaskStatus: { id: 't2', status: 'DONE' } } },
      },
    ]
    const { result } = renderHook(() => useLabor(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.advanceStatus(tasks[1])
    })

    expect(result.current.lastCompleted).toMatchObject({ title: 'Poubelles', points: 10, isOnTime: true })
  })

  it('revertStatus moves IN_PROGRESS back to TODO', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: UPDATE_TASK_STATUS, variables: { id: 't2', status: 'TODO' } },
        result: { data: { updateTaskStatus: { id: 't2', status: 'TODO' } } },
      },
    ]
    const { result } = renderHook(() => useLabor(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.revertStatus(tasks[1])
    })
  })
})
