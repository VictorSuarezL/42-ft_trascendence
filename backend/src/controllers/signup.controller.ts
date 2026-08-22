import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';

export async function createUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    console.log('Received request to create user:', { email, password });

    if (!email || !password) {
      return res.status(400).json({
        error: 'email and password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'A user with this email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0],
        passwordHash,
        emailVerified: false,
      },
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Could not create user',
    });
  }
}
