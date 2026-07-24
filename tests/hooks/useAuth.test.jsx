import { renderHook, act, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { LOGIN, REGISTER, CREATE_COLOC, JOIN_COLOC, ME, LOGOUT } from '../../src/graphql/auth'
import { useAuth } from '../../src/hooks/useAuth'
import { useAuthContext } from '../../src/context/AuthContext'
import { makeWrapper, resetAuthUser, setAuthUser } from '../utils.jsx'

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateMock }
})

function useAuthAndContext() {
  return { auth: useAuth(), context: useAuthContext() }
}

describe('useAuth', () => {
  beforeEach(() => {
    resetAuthUser()
    navigateMock.mockClear()
  })

  it('login: redirects to / when the user already has a coloc', async () => {
    const user = { id: 'u1', name: 'A', email: 'a@b.com', role: 'USER', coloc_id: 'c1' }
    const mocks = [
      {
        request: { query: LOGIN, variables: { email: 'a@b.com', password: 'secret' } },
        result: { data: { login: { user } } },
      },
      { request: { query: ME }, result: { data: { me: user } } },
    ]
    const { result } = renderHook(() => useAuthAndContext(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.context.loading).toBe(false))

    await act(async () => {
      await result.current.auth.login('a@b.com', 'secret')
    })

    expect(navigateMock).toHaveBeenCalledWith('/')
    expect(result.current.context.user).toEqual(user)
  })

  it('login: redirects to onboarding when the user has no coloc yet', async () => {
    const user = { id: 'u1', name: 'A', email: 'a@b.com', role: 'USER', coloc_id: null }
    const mocks = [
      {
        request: { query: LOGIN, variables: { email: 'a@b.com', password: 'secret' } },
        result: { data: { login: { user } } },
      },
      { request: { query: ME }, result: { data: { me: user } } },
    ]
    const { result } = renderHook(() => useAuthAndContext(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.context.loading).toBe(false))

    await act(async () => {
      await result.current.auth.login('a@b.com', 'secret')
    })

    expect(navigateMock).toHaveBeenCalledWith('/onboarding/coloc')
  })

  it('login: sets an error message on failure', async () => {
    const mocks = [
      {
        request: { query: LOGIN, variables: { email: 'a@b.com', password: 'wrong' } },
        result: { errors: [new GraphQLError('Identifiants invalides')] },
      },
    ]
    const { result } = renderHook(() => useAuthAndContext(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.context.loading).toBe(false))

    await act(async () => {
      await result.current.auth.login('a@b.com', 'wrong')
    })

    expect(result.current.auth.error).toBe('Identifiants invalides')
    expect(result.current.context.user).toBeNull()
  })

  it('register: registers then logs in', async () => {
    const user = { id: 'u1', name: 'Alice', email: 'a@b.com', role: 'USER', coloc_id: 'c1' }
    const mocks = [
      {
        request: {
          query: REGISTER,
          variables: { name: 'Alice', email: 'a@b.com', password: 'secret' },
        },
        result: { data: { register: { id: 'u1', name: 'Alice', email: 'a@b.com', role: 'USER' } } },
      },
      {
        request: { query: LOGIN, variables: { email: 'a@b.com', password: 'secret' } },
        result: { data: { login: { user } } },
      },
      { request: { query: ME }, result: { data: { me: user } } },
    ]
    const { result } = renderHook(() => useAuthAndContext(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.context.loading).toBe(false))

    await act(async () => {
      await result.current.auth.register('Alice', 'a@b.com', 'secret')
    })

    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  it('createColoc: returns the created coloc and refreshes the user', async () => {
    const mocks = [
      {
        request: { query: CREATE_COLOC, variables: { name: 'Maison' } },
        result: {
          data: { createColoc: { coloc: { id: 'c9', name: 'Maison', invite_code: 'XYZ' } } },
        },
      },
      {
        request: { query: ME },
        result: {
          data: { me: { id: 'u1', name: 'A', email: 'a@b.com', role: 'ADMIN', coloc_id: 'c9' } },
        },
      },
    ]
    const { result } = renderHook(() => useAuthAndContext(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.context.loading).toBe(false))

    let coloc
    await act(async () => {
      coloc = await result.current.auth.createColoc('Maison')
    })

    expect(coloc).toEqual({ id: 'c9', name: 'Maison', invite_code: 'XYZ' })
    expect(result.current.context.user.coloc_id).toBe('c9')
  })

  it('joinColoc: navigates home after refreshing the user', async () => {
    const mocks = [
      {
        request: { query: JOIN_COLOC, variables: { invite_code: 'XYZ' } },
        result: { data: { joinColoc: { coloc: { id: 'c9', name: 'Maison' } } } },
      },
      {
        request: { query: ME },
        result: {
          data: { me: { id: 'u1', name: 'A', email: 'a@b.com', role: 'USER', coloc_id: 'c9' } },
        },
      },
    ]
    const { result } = renderHook(() => useAuthAndContext(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.context.loading).toBe(false))

    await act(async () => {
      await result.current.auth.joinColoc('XYZ')
    })

    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  it('logout: clears the session and navigates to onboarding', async () => {
    setAuthUser({ id: 'u1', name: 'A', email: 'a@b.com', role: 'USER', coloc_id: 'c1' })
    const mocks = [
      { request: { query: LOGOUT }, result: { data: { logout: true } } },
      { request: { query: ME }, result: { data: { me: null } } },
    ]
    const { result } = renderHook(() => useAuthAndContext(), { wrapper: makeWrapper(mocks) })
    await waitFor(() => expect(result.current.context.loading).toBe(false))

    await act(async () => {
      await result.current.auth.logout()
    })

    expect(navigateMock).toHaveBeenCalledWith('/onboarding')
  })
})
