import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuthContext } from '../../src/context/AuthContext'
import { makeToken } from '../utils.jsx'

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with no token/user when localStorage is empty', () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper })
    expect(result.current.token).toBeNull()
    expect(result.current.user).toBeNull()
  })

  it('hydrates user/token from a pre-existing token in localStorage', () => {
    const token = makeToken({ id: 'u1', coloc_id: 'c1', name: 'Alice' })
    localStorage.setItem('sodalis_token', token)

    const { result } = renderHook(() => useAuthContext(), { wrapper })

    expect(result.current.token).toBe(token)
    expect(result.current.user).toEqual({ id: 'u1', coloc_id: 'c1', name: 'Alice' })
  })

  it('saveToken persists the token and decodes the user', () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper })
    const token = makeToken({ id: 'u2', coloc_id: 'c2', name: 'Bob' })

    act(() => {
      result.current.saveToken(token)
    })

    expect(localStorage.getItem('sodalis_token')).toBe(token)
    expect(result.current.token).toBe(token)
    expect(result.current.user).toEqual({ id: 'u2', coloc_id: 'c2', name: 'Bob' })
  })

  it('logout clears the token and user', () => {
    const token = makeToken({ id: 'u3', coloc_id: 'c3' })
    localStorage.setItem('sodalis_token', token)
    const { result } = renderHook(() => useAuthContext(), { wrapper })

    act(() => {
      result.current.logout()
    })

    expect(localStorage.getItem('sodalis_token')).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.user).toBeNull()
  })
})
