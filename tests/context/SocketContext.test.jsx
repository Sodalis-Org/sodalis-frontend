import { renderHook, act } from '@testing-library/react'
import { io } from 'socket.io-client'
import { AuthProvider } from '../../src/context/AuthContext'
import { SocketProvider, useSocket } from '../../src/context/SocketContext'
import { setAuthUser } from '../utils.jsx'

function wrapper({ children }) {
  return (
    <AuthProvider>
      <SocketProvider>{children}</SocketProvider>
    </AuthProvider>
  )
}

describe('SocketContext', () => {
  beforeEach(() => {
    localStorage.clear()
    io.mockClear()
  })

  it('does not connect when the user has no coloc_id', () => {
    const { result } = renderHook(() => useSocket(), { wrapper })

    expect(io).not.toHaveBeenCalled()
    expect(result.current.notifications).toEqual([])
    expect(result.current.unreadCount).toBe(0)
  })

  it('connects and listens for the coloc notification channel when a coloc_id is present', () => {
    setAuthUser({ id: 'u1', coloc_id: 'c1' })

    renderHook(() => useSocket(), { wrapper })

    expect(io).toHaveBeenCalledTimes(1)
    const socketInstance = io.mock.results[0].value
    expect(socketInstance.on).toHaveBeenCalledWith('coloc_c1_notifications', expect.any(Function))
  })

  it('appends incoming notifications and increments unreadCount', () => {
    setAuthUser({ id: 'u1', coloc_id: 'c1' })
    const { result } = renderHook(() => useSocket(), { wrapper })
    const socketInstance = io.mock.results[0].value

    act(() => {
      socketInstance.__handlers['coloc_c1_notifications']({ type: 'TASK_DONE', message: 'hi' })
    })

    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.notifications[0]).toMatchObject({ type: 'TASK_DONE', message: 'hi' })
    expect(result.current.unreadCount).toBe(1)
  })

  it('markAllRead resets unreadCount to 0', () => {
    setAuthUser({ id: 'u1', coloc_id: 'c1' })
    const { result } = renderHook(() => useSocket(), { wrapper })
    const socketInstance = io.mock.results[0].value

    act(() => {
      socketInstance.__handlers['coloc_c1_notifications']({ type: 'TASK_DONE' })
    })
    expect(result.current.unreadCount).toBe(1)

    act(() => {
      result.current.markAllRead()
    })
    expect(result.current.unreadCount).toBe(0)
  })
})
