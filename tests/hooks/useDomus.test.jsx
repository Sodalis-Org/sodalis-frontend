import { renderHook, act, waitFor } from '@testing-library/react'
import { GET_USERS_BY_COLOC } from '../../src/graphql/users'
import { GET_MY_COLOC, REGENERATE_INVITE_CODE, KICK_MEMBER, TRANSFER_ADMIN } from '../../src/graphql/auth'
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

  it('exposes members and coloc once queries resolve', async () => {
    const { result } = renderHook(() => useDomus(), { wrapper: makeWrapper(baseMocks()) })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.members).toHaveLength(2)
    expect(result.current.coloc).toEqual({ id: colocId, name: 'Maison', invite_code: 'XYZ' })
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.currentUserId).toBe('u1')
  })

  it('regenerateInvite returns the updated coloc', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: REGENERATE_INVITE_CODE },
        result: { data: { regenerateInviteCode: { coloc: { id: colocId, name: 'Maison', invite_code: 'NEW' } } } },
      },
      {
        request: { query: GET_MY_COLOC },
        result: { data: { myColoc: { id: colocId, name: 'Maison', invite_code: 'NEW' } } },
      },
    ]
    const { result } = renderHook(() => useDomus(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    let updated
    await act(async () => {
      updated = await result.current.regenerateInvite()
    })
    expect(updated).toEqual({ id: colocId, name: 'Maison', invite_code: 'NEW' })
  })

  it('kickMember sets actionError on failure', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: KICK_MEMBER, variables: { userId: 'u2' } },
        error: new Error('Network error'),
      },
    ]
    const { result } = renderHook(() => useDomus(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok
    await act(async () => {
      ok = await result.current.kickMember('u2')
    })
    expect(ok).toBe(false)
    expect(result.current.actionError).toBe('Network error')
  })

  it('transferAdmin calls the mutation without throwing', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: { query: TRANSFER_ADMIN, variables: { userId: 'u2' } },
        result: { data: { transferAdmin: { id: 'u2', role: 'ADMIN' } } },
      },
    ]
    const { result } = renderHook(() => useDomus(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.transferAdmin('u2')
    })
  })
})
