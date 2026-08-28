import type { Server, Socket } from 'socket.io';

export function emitToAll(io: Server, event: string, data: unknown) {
  io.emit(event, data);
}

export function emitToSocket(socket: Socket, event: string, data: unknown) {
  socket.emit(event, data);
}

export function emitToOthers(socket: Socket, event: string, data: unknown) {
  socket.broadcast.emit(event, data);
}
