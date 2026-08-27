import type { Socket } from 'socket.io';
import { parse } from 'cookie';
import { getSessionUser } from '../../services/session.services';

export async function socketAuth(socket: Socket, next: (err?: Error) => void) {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error('Authentication required'));
    }

    const cookies = parse(cookieHeader);
    const sessionId = cookies.session;

    if (!sessionId) {
      return next(new Error('Authentication required'));
    }

    const user = await getSessionUser(sessionId);

    if (!user) {
      return next(new Error('Invalid or expired session'));
    }

    socket.data.user = user;

    next();
  } catch (error) {
    console.error('[Socket Auth] Error:', error);

    next(new Error('Authentication failed'));
  }
}
