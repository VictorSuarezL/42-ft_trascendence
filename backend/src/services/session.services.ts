import crypto from 'node:crypto';
import { prisma } from '../utils/prisma';

export async function createSession(userId: number) {
  const id = crypto.randomBytes(32).toString('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.session.create({
    data: {
      id,
      userId,
      expiresAt,
    },
  });

  return { id, expiresAt };
}

export async function getSessionUser(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  return session.user;
}
