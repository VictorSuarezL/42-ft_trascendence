import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcrypt';
import { createSession } from '../services/session.services';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function getUsers(_req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(users);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Could not get users',
    });
  }
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in',
      });
    }

    // lets use bcrypt to compare the password
    // with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.passwordHash ?? '');
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    const session = await createSession(user.id);

    res.cookie('session', session.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      expires: session.expiresAt,
    });

    return res.json({
      message: 'Login successful',
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Could not login user',
    });
  }
}

export async function updateCurrentUser(req: Request, res: Response) {
  try {
    const sessionId = req.cookies.session;

    if (!sessionId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { login, firstName, lastName, displayName } = req.body;
    const file = req.file as Express.Multer.File | undefined;

    const oldImage = session.user.image;
    const imagePath = file ? `/uploads/${file.filename}` : undefined;

    if (file && oldImage?.startsWith('/uploads/')) {
      const oldImagePath = resolve(process.cwd(), `.${oldImage}`);

      await unlink(oldImagePath).catch(() => null);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(login !== undefined && { login }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(displayName !== undefined && { displayName }),
        ...(imagePath !== undefined && { image: imagePath }),
      },
    });

    return res.json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not update user' });
  }
}
