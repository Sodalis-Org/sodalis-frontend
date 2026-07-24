import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuthContext } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuthContext()
  const socketRef = useRef(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user?.coloc_id) return

    const socket = io(
      import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3003',
      { transports: ['websocket'], withCredentials: true }
    )
    socketRef.current = socket

    // Le serveur décide seul de la room (basée sur le cookie vérifié au handshake) ;
    // le nom d'événement n'a plus besoin d'encoder le coloc_id côté client.
    socket.on('notification', (event) => {
      setNotifications((prev) => [{ ...event, _id: Date.now() }, ...prev].slice(0, 50))
      setUnreadCount((n) => n + 1)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user?.coloc_id])

  const markAllRead = useCallback(() => setUnreadCount(0), [])

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, setNotifications, unreadCount, markAllRead }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
