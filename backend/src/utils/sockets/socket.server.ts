import type { Server } from 'socket.io';
import { getUserRoom } from './socket.rooms';

let socketServer: Server | null = null;

export function setSocketServer(server: Server) {
  socketServer = server;
}

export function emitToUserRoom(
  userId: number,
  event: string,
  payload: unknown,
) {
  socketServer?.to(getUserRoom(userId)).emit(event, payload);
}
