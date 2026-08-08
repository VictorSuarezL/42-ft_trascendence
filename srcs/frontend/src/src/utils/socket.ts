import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

let socket: Socket | null = null;

export function createSocket(token?: string) {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    auth: token ? { token } : undefined,
  });

  return socket;
}

export function getSocket() {
  if (!socket) {
    throw new Error('Socket has not been created yet');
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
