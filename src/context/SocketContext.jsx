import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { io } from 'socket.io-client'
import { useAuthContext } from './AuthContext'
import { GET_UNREAD_NOTIFICATIONS_COUNT, MARK_NOTIFICATIONS_READ } from '../graphql/dashboard'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuthContext()
  const colocId = user?.coloc_id
  const [socket, setSocket] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Curseur "lu jusqu'à" persisté côté serveur (service-concordia) : sans ça, le
  // badge non-lu repart de 0 à chaque refresh alors que rien n'a réellement été lu.
  const { data: unreadData } = useQuery(GET_UNREAD_NOTIFICATIONS_COUNT, {
    variables: { colocId },
    skip: !colocId,
    fetchPolicy: 'network-only',
  })
  const [markNotificationsReadMutation] = useMutation(MARK_NOTIFICATIONS_READ)

  useEffect(() => {
    if (typeof unreadData?.unreadNotificationsCount === 'number') {
      setUnreadCount(unreadData.unreadNotificationsCount)
    }
  }, [unreadData])

  useEffect(() => {
    if (!colocId) return

    const newSocket = io(
      import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3003',
      { transports: ['websocket'], withCredentials: true }
    )
    setSocket(newSocket)

    // Le serveur décide seul de la room (basée sur le cookie vérifié au handshake) ;
    // le nom d'événement n'a plus besoin d'encoder le coloc_id côté client.
    newSocket.on('notification', (event) => {
      setNotifications((prev) => [{ ...event, _id: Date.now() }, ...prev].slice(0, 50))
      setUnreadCount((n) => n + 1)
    })

    return () => {
      newSocket.disconnect()
      setSocket(null)
    }
  }, [colocId])

  const markAllRead = useCallback(() => {
    setUnreadCount(0)
    if (colocId) markNotificationsReadMutation({ variables: { colocId } }).catch(() => {})
  }, [colocId, markNotificationsReadMutation])

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications, unreadCount, markAllRead }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
