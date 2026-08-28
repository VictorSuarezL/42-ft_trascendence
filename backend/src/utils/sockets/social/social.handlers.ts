import type { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../socket.events';
import type {
  FriendAcceptPayload,
  FriendRequestPayload,
  MessageSendPayload,
} from './social.types';
import { getUserRoom } from '../socket.rooms';

export function registerSocialHandlers(io: Server, socket: Socket) {
  socket.on(
    SOCKET_EVENTS.SOCIAL.MESSAGE_SEND,
    async (payload: MessageSendPayload) => {
      const user = socket.data.user;

      console.log('[Social] Message send:', {
        userId: user.id,
        message: payload.message,
      });

      io.emit(SOCKET_EVENTS.SOCIAL.MESSAGE_RECEIVED, {
        id: crypto.randomUUID(),
        user: {
          id: user.id,
          displayName: user.displayName,
          avatarUrl: user.image,
        },
        message: payload.message,
        createdAt: new Date().toISOString(),
      });
    },
  );

  socket.on(
    SOCKET_EVENTS.SOCIAL.FRIEND_REQUEST,
    async ({ userId }: FriendRequestPayload) => {
      const senderId = socket.data.user.id;

      console.log('[Social] Friend request:', {
        senderId,
        receiverId: userId,
      });

      io.to(getUserRoom(userId)).emit(SOCKET_EVENTS.SOCIAL.FRIEND_REQUESTED, {
        userId: senderId,
      });
    },
  );

  socket.on(
    SOCKET_EVENTS.SOCIAL.FRIEND_ACCEPT,
    async ({ userId }: FriendAcceptPayload) => {
      const accepterId = socket.data.user.id;

      console.log('[Social] Friend accept:', {
        accepterId,
        requesterId: userId,
      });

      io.to(getUserRoom(userId)).emit(SOCKET_EVENTS.SOCIAL.FRIEND_ACCEPTED, {
        userId: accepterId,
      });
    },
  );
}
