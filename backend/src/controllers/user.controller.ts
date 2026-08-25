import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcrypt';
import { createSession } from '../services/session.services';

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
