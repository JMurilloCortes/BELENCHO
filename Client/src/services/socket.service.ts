import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function connectSocket(token: string) {
  if (socket?.connected) return socket

  socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:4000', {
    auth: { token },
    transports: ['websocket', 'polling'],
  })

  socket.on('connect_error', (err) => {
    console.error('Socket error:', err.message)
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function getSocket() {
  return socket
}
