import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function connectSocket(token: string) {
  if (socket?.connected) return socket
  if (socket) {
    socket.connect()
    return socket
  }

  socket = io(window.location.origin, {
    path: '/api/socket.io',
    auth: { token },
    query: { token },
    transports: ['polling', 'websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    console.log('[Socket] Conectado')
  })

  socket.on('connect_error', (err) => {
    console.error('[Socket] Error:', err.message)
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Desconectado:', reason)
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}

export function getSocket() {
  return socket
}
