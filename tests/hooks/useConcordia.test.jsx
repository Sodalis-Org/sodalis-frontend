import { renderHook, act, waitFor } from '@testing-library/react'
import { GET_USERS_BY_COLOC } from '../../src/graphql/users'
import {
  GET_COMPLAINTS,
  CREATE_COMPLAINT,
  RESOLVE_COMPLAINT,
  DELETE_COMPLAINT,
  GET_POLLS,
  CREATE_POLL,
  VOTE_POLL,
  THANK_USER,
} from '../../src/graphql/concordia'
import { useConcordia } from '../../src/hooks/useConcordia'
import { setAuthUser, makeWrapper } from '../utils.jsx'

const colocId = 'c1'

function baseMocks() {
  return [
    {
      request: { query: GET_USERS_BY_COLOC, variables: { colocId } },
      result: { data: { usersByColoc: [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }] } },
    },
    {
      request: { query: GET_COMPLAINTS, variables: { colocId } },
      result: { data: { complaints: [{ id: 'cp1', message: 'Bruit', status: 'OPEN' }] } },
    },
    {
      request: { query: GET_POLLS, variables: { colocId } },
      result: { data: { polls: [{ id: 'p1', question: 'Menage ?', status: 'OPEN' }] } },
    },
  ]
}

describe('useConcordia', () => {
  beforeEach(() => {
    localStorage.clear()
    setAuthUser({ id: 'u1', coloc_id: colocId, role: 'ADMIN' })
  })

  it('exposes members, complaints and polls once queries resolve', async () => {
    const { result } = renderHook(() => useConcordia(), { wrapper: makeWrapper(baseMocks()) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.members).toHaveLength(2)
    expect(result.current.complaints).toHaveLength(1)
    expect(result.current.polls).toHaveLength(1)
    expect(result.current.isAdmin).toBe(true)
  })

  it('createComplaint returns true on success', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: {
          query: CREATE_COMPLAINT,
          variables: { coloc_id: colocId, message: 'Bruit la nuit', target_id: undefined, is_anonymous: false },
        },
        result: { data: { createComplaint: { id: 'cp2' } } },
      },
    ]
    const { result } = renderHook(() => useConcordia(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok
    await act(async () => {
      ok = await result.current.createComplaint({ message: 'Bruit la nuit', target_id: null, is_anonymous: false })
    })

    expect(ok).toBe(true)
    expect(result.current.complaintError).toBeNull()
  })

  it('createComplaint sets complaintError on failure', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: {
          query: CREATE_COMPLAINT,
          variables: { coloc_id: colocId, message: '', target_id: undefined, is_anonymous: false },
        },
        error: new Error('Network error'),
      },
    ]
    const { result } = renderHook(() => useConcordia(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createComplaint({ message: '', target_id: null, is_anonymous: false })
    })

    expect(result.current.complaintError).toBe('Network error')
  })

  it('createPoll rejects when fewer than 2 non-empty options are given', async () => {
    const { result } = renderHook(() => useConcordia(), { wrapper: makeWrapper(baseMocks()) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok
    await act(async () => {
      ok = await result.current.createPoll({ question: 'Q', options: ['only one', ''] })
    })

    expect(ok).toBe(false)
    expect(result.current.pollError).toBe('Au moins 2 options sont requises.')
  })

  it('createPoll succeeds with valid options', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: CREATE_POLL, variables: { coloc_id: colocId, question: 'Q', options: ['A', 'B'] } },
        result: { data: { createPoll: { id: 'p2' } } },
      },
    ]
    const { result } = renderHook(() => useConcordia(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok
    await act(async () => {
      ok = await result.current.createPoll({ question: 'Q', options: ['A', 'B'] })
    })

    expect(ok).toBe(true)
  })

  it('votePoll, resolveComplaint and deleteComplaint call their mutations without throwing', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: VOTE_POLL, variables: { poll_id: 'p1', option_id: 'o1' } },
        result: { data: { votePoll: { id: 'p1' } } },
      },
      {
        request: { query: RESOLVE_COMPLAINT, variables: { id: 'cp1' } },
        result: { data: { resolveComplaint: { id: 'cp1', status: 'RESOLVED' } } },
      },
      {
        request: { query: DELETE_COMPLAINT, variables: { id: 'cp1' } },
        result: { data: { deleteComplaint: { id: 'cp1' } } },
      },
    ]
    const { result } = renderHook(() => useConcordia(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.votePoll('p1', 'o1')
    })
    await act(async () => {
      await result.current.resolveComplaint('cp1')
    })
    await act(async () => {
      await result.current.deleteComplaint('cp1')
    })
  })

  it('thankUser sets karmaFeedback with the returned score', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: THANK_USER, variables: { target_id: 'u2' } },
        result: { data: { thankUser: { score: 42 } } },
      },
    ]
    const { result } = renderHook(() => useConcordia(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.thankUser('u2', 'Bob')
    })

    expect(result.current.karmaFeedback).toEqual({ name: 'Bob', score: 42 })
  })
})
