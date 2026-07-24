import { renderHook, waitFor, act } from '@testing-library/react'
import { io } from 'socket.io-client'
import { useSocket } from '../../src/context/SocketContext'
import { useAuthContext } from '../../src/context/AuthContext'
import { setAuthUser, resetAuthUser, makeWrapper } from '../utils.jsx'

function useSocketAndContext() {
  return { socket: useSocket(), context: useAuthContext() }
}

describe('SocketContext', () => {
  beforeEach(() => {
    resetAuthUser()
    io.mockClear()
  })

  it('does not connect when the user has no coloc_id', async () => {
    const { result } = renderHook(() => useSocketAndContext(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.context.loading).toBe(false))

    expect(io).not.toHaveBeenCalled()
    expect(result.current.socket.notifications).toEqual([])
    expect(result.current.socket.unreadCount).toBe(0)
  })

  it('connects and listens for the notification event when a coloc_id is present', async () => {
    setAuthUser({ id: 'u1', coloc_id: 'c1' })
    renderHook(() => useSocketAndContext(), { wrapper: makeWrapper() })
    await waitFor(() => expect(io).toHaveBeenCalledTimes(1))

    const socketInstance = io.mock.results[0].value
    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ withCredentials: true }),
    )
    expect(socketInstance.on).toHaveBeenCalledWith('notification', expect.any(Function))
  })

  it('appends incoming notifications and increments unreadCount', async () => {
    setAuthUser({ id: 'u1', coloc_id: 'c1' })
    const { result } = renderHook(() => useSocketAndContext(), { wrapper: makeWrapper() })
    await waitFor(() => expect(io).toHaveBeenCalledTimes(1))
    const socketInstance = io.mock.results[0].value

    act(() => {
      socketInstance.__handlers['notification']({ type: 'TASK_DONE', message: 'hi' })
    })

    expect(result.current.socket.notifications).toHaveLength(1)
    expect(result.current.socket.notifications[0]).toMatchObject({
      type: 'TASK_DONE',
      message: 'hi',
    })
    expect(result.current.socket.unreadCount).toBe(1)
  })

  it('markAllRead resets unreadCount to 0', async () => {
    setAuthUser({ id: 'u1', coloc_id: 'c1' })
    const { result } = renderHook(() => useSocketAndContext(), { wrapper: makeWrapper() })
    await waitFor(() => expect(io).toHaveBeenCalledTimes(1))
    const socketInstance = io.mock.results[0].value

    act(() => {
      socketInstance.__handlers['notification']({ type: 'TASK_DONE' })
    })
    expect(result.current.socket.unreadCount).toBe(1)

    act(() => {
      result.current.socket.markAllRead()
    })
    expect(result.current.socket.unreadCount).toBe(0)
  })
})
