import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { useSocket } from '../../../context/SocketContext'
import Avatar from '../../../components/Avatar'

function useSocketConnected() {
  const { socket } = useSocket()
  const [connected, setConnected] = useState(socket?.connected ?? false)

  useEffect(() => {
    if (!socket) return
    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    setConnected(socket.connected)
    return () => { socket.off('connect', onConnect); socket.off('disconnect', onDisconnect) }
  }, [socket])

  return connected
}

export default function DashboardHeader({ name }) {
  const connected = useSocketConnected()

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0">
        <Avatar name={name} size="lg" />
        <span
          aria-hidden="true"
          className={clsx(
            'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background',
            connected ? 'bg-secondary' : 'bg-muted-foreground/40'
          )}
        />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Bon retour chez nous,</p>
        <h1 className="text-xl font-bold text-foreground leading-tight">
          Salut {name ?? 'Colocataire'} ! <span aria-hidden="true">👋</span>
        </h1>
      </div>
    </div>
  )
}
