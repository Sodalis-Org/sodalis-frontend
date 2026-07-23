import { renderHook, act } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { LOGIN, REGISTER, CREATE_COLOC, JOIN_COLOC } from '../../src/graphql/auth'
import { useAuth } from '../../src/hooks/useAuth'
import { makeToken, makeWrapper } from '../utils.jsx'

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => navigateMock }
})

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    navigateMock.mockClear()
  })

  it('login: saves the token and redirects to / when the user already has a coloc', async () => {
    const token = makeToken({ id: 'u1', coloc_id: 'c1' })
    const mocks = [
      {
        request: { query: LOGIN, variables: { email: 'a@b.com', password: 'secret' } },
        result: { data: { login: { token, user: { id: 'u1', name: 'A', email: 'a@b.com', role: 'USER' } } } },
      },
    ]
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(mocks) })

    await act(async () => {
      await result.current.login('a@b.com', 'secret')
    })

    expect(localStorage.getItem('sodalis_token')).toBe(token)
    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  it('login: redirects to onboarding when the user has no coloc yet', async () => {
    const token = makeToken({ id: 'u1' })
    const mocks = [
      {
        request: { query: LOGIN, variables: { email: 'a@b.com', password: 'secret' } },
        result: { data: { login: { token, user: { id: 'u1', name: 'A', email: 'a@b.com', role: 'USER' } } } },
      },
    ]
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(mocks) })

    await act(async () => {
      await result.current.login('a@b.com', 'secret')
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
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(mocks) })

    await act(async () => {
      await result.current.login('a@b.com', 'wrong')
    })

    expect(result.current.error).toBe('Identifiants invalides')
    expect(localStorage.getItem('sodalis_token')).toBeNull()
  })

  it('register: registers then logs in', async () => {
    const token = makeToken({ id: 'u1', coloc_id: 'c1' })
    const mocks = [
      {
        request: { query: REGISTER, variables: { name: 'Alice', email: 'a@b.com', password: 'secret' } },
        result: { data: { register: { id: 'u1', name: 'Alice', email: 'a@b.com', role: 'USER' } } },
      },
      {
        request: { query: LOGIN, variables: { email: 'a@b.com', password: 'secret' } },
        result: { data: { login: { token, user: { id: 'u1', name: 'Alice', email: 'a@b.com', role: 'USER' } } } },
      },
    ]
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(mocks) })

    await act(async () => {
      await result.current.register('Alice', 'a@b.com', 'secret')
    })

    expect(localStorage.getItem('sodalis_token')).toBe(token)
    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  it('createColoc: saves the new token and returns the created coloc', async () => {
    const token = makeToken({ id: 'u1', coloc_id: 'c9' })
    const mocks = [
      {
        request: { query: CREATE_COLOC, variables: { name: 'Maison' } },
        result: { data: { createColoc: { coloc: { id: 'c9', name: 'Maison', invite_code: 'XYZ' }, token } } },
      },
    ]
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(mocks) })

    let coloc
    await act(async () => {
      coloc = await result.current.createColoc('Maison')
    })

    expect(coloc).toEqual({ id: 'c9', name: 'Maison', invite_code: 'XYZ' })
    expect(localStorage.getItem('sodalis_token')).toBe(token)
  })

  it('joinColoc: saves the token and navigates home', async () => {
    const token = makeToken({ id: 'u1', coloc_id: 'c9' })
    const mocks = [
      {
        request: { query: JOIN_COLOC, variables: { invite_code: 'XYZ' } },
        result: { data: { joinColoc: { coloc: { id: 'c9', name: 'Maison' }, token } } },
      },
    ]
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(mocks) })

    await act(async () => {
      await result.current.joinColoc('XYZ')
    })

    expect(localStorage.getItem('sodalis_token')).toBe(token)
    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  it('logout: clears the session and navigates to onboarding', () => {
    setToken()
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper([]) })

    act(() => {
      result.current.logout()
    })

    expect(localStorage.getItem('sodalis_token')).toBeNull()
    expect(navigateMock).toHaveBeenCalledWith('/onboarding')
  })
})

function setToken() {
  localStorage.setItem('sodalis_token', makeToken({ id: 'u1', coloc_id: 'c1' }))
}
