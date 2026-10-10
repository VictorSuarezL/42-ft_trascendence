import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { isUserOnline } from '../utils/sockets/presence.store';
import { SOCKET_EVENTS } from '../utils/sockets/socket.events';
import { emitToUserRoom } from '../utils/sockets/socket.server';

const publicUserSelect = {
  id: true,
  login: true,
  firstName: true,
  lastName: true,
  displayName: true,
  image: true,
} as const;

function orderPair(firstId: number, secondId: number) {
  return firstId < secondId
    ? { userOneId: firstId, userTwoId: secondId }
    : { userOneId: secondId, userTwoId: firstId };
}

async function getAuthenticatedSession(req: Request) {
  const sessionId = req.cookies.session;

  if (!sessionId) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function getConversations(req: Request, res: Response) {
  try {
    const session = await getAuthenticatedSession(req);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversations = await (prisma as any).conversation.findMany({
      where: {
        OR: [{ userOneId: session.userId }, { userTwoId: session.userId }],
      },
      include: {
        userOne: {
          select: publicUserSelect,
        },
        userTwo: {
          select: publicUserSelect,
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: publicUserSelect,
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    const items = conversations.map((conversation: any) => {
      const friend =
        conversation.userOne.id === session.userId
          ? conversation.userTwo
          : conversation.userOne;

      return {
        id: conversation.id,
        friend,
        lastMessage: conversation.messages[0] ?? null,
        updatedAt: conversation.lastMessageAt ?? conversation.updatedAt,
        isOnline: isUserOnline(friend.id),
      };
    });

    return res.json({ conversations: items });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: 'Could not get conversations' });
  }
}

export async function createOrGetConversation(req: Request, res: Response) {
  try {
    const session = await getAuthenticatedSession(req);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const friendId = Number(req.params.friendId);

    if (Number.isNaN(friendId)) {
      return res.status(400).json({ error: 'Invalid friend id' });
    }

    if (friendId === session.userId) {
      return res.status(400).json({ error: 'You cannot chat with yourself' });
    }

    const friendship = await prisma.friendship.findFirst({
      where: {
        isAccepted: true,
        isBlocked: false,
        OR: [
          { userOneId: session.userId, userTwoId: friendId },
          { userOneId: friendId, userTwoId: session.userId },
        ],
      },
    });

    if (!friendship) {
      return res
        .status(403)
        .json({ error: 'You are not friends with this user' });
    }

    const pair = orderPair(session.userId, friendId);

    let conversation = await (prisma as any).conversation.findFirst({
      where: pair,
      include: {
        userOne: { select: publicUserSelect },
        userTwo: { select: publicUserSelect },
      },
    });

    if (!conversation) {
      conversation = await (prisma as any).conversation.create({
        data: pair,
        include: {
          userOne: { select: publicUserSelect },
          userTwo: { select: publicUserSelect },
        },
      });
    }

    const friend =
      conversation.userOne.id === session.userId
        ? conversation.userTwo
        : conversation.userOne;

    return res.json({
      conversation: {
        id: conversation.id,
        friend,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: 'Could not open conversation' });
  }
}

export async function getConversationMessages(req: Request, res: Response) {
  try {
    const session = await getAuthenticatedSession(req);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversationId = Number(req.params.conversationId);

    if (Number.isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation id' });
    }

    const conversation = await (prisma as any).conversation.findUnique({
      where: { id: conversationId },
      include: {
        userOne: { select: publicUserSelect },
        userTwo: { select: publicUserSelect },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: publicUserSelect,
            },
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (
      conversation.userOneId !== session.userId &&
      conversation.userTwoId !== session.userId
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const friend =
      conversation.userOne.id === session.userId
        ? conversation.userTwo
        : conversation.userOne;

    return res.json({
      conversation: {
        id: conversation.id,
        friend,
      },
      messages: conversation.messages.map((message: any) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        sender: message.sender,
      })),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: 'Could not get messages' });
  }
}

export async function sendConversationMessage(req: Request, res: Response) {
  try {
    const session = await getAuthenticatedSession(req);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversationId = Number(req.params.conversationId);

    if (Number.isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation id' });
    }

    const content =
      typeof req.body?.content === 'string' ? req.body.content.trim() : '';

    if (!content) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const conversation = await (prisma as any).conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (
      conversation.userOneId !== session.userId &&
      conversation.userTwoId !== session.userId
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const message = await (prisma as any).message.create({
      data: {
        conversationId,
        senderId: session.userId,
        content,
      },
      include: {
        sender: {
          select: publicUserSelect,
        },
      },
    });

    await (prisma as any).conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    const recipientId =
      conversation.userOneId === session.userId
        ? conversation.userTwoId
        : conversation.userOneId;

    const payload = {
      conversationId,
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        sender: message.sender,
      },
    };

    emitToUserRoom(recipientId, SOCKET_EVENTS.SOCIAL.MESSAGE_RECEIVED, payload);

    if (!isUserOnline(recipientId)) {
      await (prisma as any).messageNotification.create({
        data: {
          recipientId,
          senderId: session.userId,
          conversationId,
          preview: content.slice(0, 140),
        },
      });
    }

    return res.json({
      message: payload.message,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: 'Could not send message' });
  }
}
