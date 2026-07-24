import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuthContext } from '../../src/context/AuthContext'
import { ME, LOGOUT } from '../../src/graphql/auth'

function wrapper(mocks) {
  return function Wrapper({ children }) {
    return (
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthProvider>{children}</AuthProvider>
      </MockedProvider>
    )
  }
}

describe('AuthContext', () => {
  it('starts with no user when the me query resolves to null', async () => {
    const mocks = [{ request: { query: ME }, result: { data: { me: null } } }]
    const { result } = renderHook(() => useAuthContext(), { wrapper: wrapper(mocks) })

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  it('hydrates the user from the me query', async () => {
    const user = { id: 'u1', coloc_id: 'c1', name: 'Alice', email: 'a@b.com', role: 'MEMBER' }
    const mocks = [{ request: { query: ME }, result: { data: { me: user } } }]
    const { result } = renderHook(() => useAuthContext(), { wrapper: wrapper(mocks) })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toEqual(user)
  })

  it('logout calls the logout mutation and clears the user', async () => {
    const user = { id: 'u1', coloc_id: 'c1', name: 'Alice', email: 'a@b.com', role: 'MEMBER' }
    const mocks = [
      { request: { query: ME }, result: { data: { me: user } } },
      { request: { query: LOGOUT }, result: { data: { logout: true } } },
      { request: { query: ME }, result: { data: { me: null } } },
    ]
    const { result } = renderHook(() => useAuthContext(), { wrapper: wrapper(mocks) })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toEqual(user)

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
  })
})
