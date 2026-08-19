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
