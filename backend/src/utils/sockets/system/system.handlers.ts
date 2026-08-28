import type { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../socket.events';
import { getUserRoom } from '../socket.rooms';

export function registerSystemHandlers(io: Server, socket: Socket) {
  const userId = socket.data.user.id;
  const userRoom = getUserRoom(userId);

  socket.join(userRoom);

  console.log('[System] User joined room:', {
    userId,
    room: userRoom,
  });

  socket.emit(SOCKET_EVENTS.SYSTEM.CONNECTED, {
    socketId: socket.id,
    userId,
  });

  io.emit(SOCKET_EVENTS.SOCIAL.PRESENCE_CHANGED, {
    userId,
    status: 'online',
  });

  socket.on('disconnect', (reason) => {
    console.log('[System] Socket disconnected:', {
      socketId: socket.id,
      userId,
      reason,
    });

    io.emit(SOCKET_EVENTS.SOCIAL.PRESENCE_CHANGED, {
      userId,
      status: 'offline',
    });
  });
}
