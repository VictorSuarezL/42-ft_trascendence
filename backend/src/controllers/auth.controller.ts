import { Request, Response } from 'express';
import { mapFortyTwoUser } from '../utils/mapUser';
import { createSession } from '../services/session.services';
import { prisma } from '../utils/prisma';
import { generateToken, hashToken } from '../utils/tokenUtils';
import { sendPasswordResetEmail } from '../utils/emailUtil';
import bcrypt from 'bcrypt';

const { FORTYTWO_CLIENT_ID, FORTYTWO_CLIENT_SECRET, FORTYTWO_REDIRECT_URI } =
  process.env;

export function loginWithFortyTwo(_req: Request, res: Response) {
  const params = new URLSearchParams({
    client_id: FORTYTWO_CLIENT_ID!,
    redirect_uri: FORTYTWO_REDIRECT_URI!,
    response_type: 'code',
  });

  res.redirect(`https://api.intra.42.fr/oauth/authorize?${params.toString()}`);
}

export async function fortyTwoCallback(req: Request, res: Response) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).send('Missing authorization code');
  }

  try {
    const response = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: FORTYTWO_CLIENT_ID!,
        client_secret: FORTYTWO_CLIENT_SECRET!,
        code,
        redirect_uri: FORTYTWO_REDIRECT_URI!,
      }),
    });

    const token = await response.json();

    if (!response.ok) {
      console.error(token);

      return res.status(400).json(token);
    }

    const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return res.status(400).send('Could not retrieve 42 user');
    }

    const fortyTwoUser = await userResponse.json();

    const user = await prisma.user.upsert({
      where: {
        fortyTwoId: fortyTwoUser.id,
      },
      update: {
        email: fortyTwoUser.email,
        firstName: fortyTwoUser.first_name,
        lastName: fortyTwoUser.last_name,
        displayName: fortyTwoUser.displayname,
        image: fortyTwoUser.image?.link,
      },
      create: {
        fortyTwoId: fortyTwoUser.id,
        email: fortyTwoUser.email,
        name: fortyTwoUser.displayname,
        firstName: fortyTwoUser.first_name,
        lastName: fortyTwoUser.last_name,
        displayName: fortyTwoUser.displayname,
        image: fortyTwoUser.image?.link,
        emailVerified: true,
      },
    });

    const session = await createSession(user.id);

    console.log('42 login successful');
    res.cookie('session', session.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      expires: session.expiresAt,
    });

    return res.redirect('http://localhost:5173/home');
  } catch (error) {
    console.error(error);

    return res.status(500).send('OAuth error');
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  const sessionId = req.cookies.session;
  console.log('session cookie:', req.cookies.session);

  if (!sessionId) {
    return res.status(401).json({
      user: null,
    });
  }

  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: true,
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return res.status(401).json({
      user: null,
    });
  }

  return res.json({
    user: session.user,
  });
}

export async function logout(req: Request, res: Response) {
  const sessionId = req.cookies.session;

  if (sessionId) {
    await prisma.session.deleteMany({
      where: {
        id: sessionId,
      },
    });
  }

  res.clearCookie('session');

  return res.json({
    success: true,
  });
}

export async function confirmEmail(req: Request, res: Response) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token is required',
      });
    }
    console.log('Received token:', token);
    const tokenHash = hashToken(token);
    console.log('tokenHash:', tokenHash);

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: {
        tokenHash,
      },
    });
    console.log('verificationToken:', verificationToken);

    if (!verificationToken) {
      return res.status(400).json({
        error: 'Invalid verification token',
      });
    }

    if (verificationToken.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({
        where: {
          id: verificationToken.id,
        },
      });

      return res.status(410).json({
        error: 'Verification token has expired',
      });
    }

    await prisma.user.update({
      where: {
        id: verificationToken.userId,
      },
      data: {
        emailVerified: true,
      },
    });

    // Token de un solo uso
    await prisma.emailVerificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    });

    return res.status(200).json({
      message: 'Email successfully verified',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Could not verify email',
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // No revelar si el email existe
    if (!user) {
      return res.status(200).json({
        message: 'If the email exists, a reset link has been sent',
      });
    }

    const token = generateToken();
    console.log('Generated token:', token);
    const tokenHash = hashToken(token);

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Eliminar tokens anteriores
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl,
      });
    } catch (error) {
      console.error('Could not send password reset email:', error);
    }

    return res.status(200).json({
      message: 'If the email exists, a reset link has been sent',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Could not process password reset',
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        error: 'Token and password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters',
      });
    }

    const tokenHash = hashToken(token);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
    });

    if (!resetToken) {
      return res.status(400).json({
        error: 'Invalid password reset token',
      });
    }

    if (resetToken.usedAt) {
      return res.status(400).json({
        error: 'Password reset token has already been used',
      });
    }

    if (resetToken.expiresAt < new Date()) {
      return res.status(410).json({
        error: 'Password reset token has expired',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        passwordHash,
      },
    });

    await prisma.passwordResetToken.update({
      where: {
        id: resetToken.id,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Opcional pero recomendable:
    // invalidar todas las sesiones existentes
    await prisma.session.deleteMany({
      where: {
        userId: resetToken.userId,
      },
    });

    return res.status(200).json({
      message: 'Password successfully reset',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Could not reset password',
    });
  }
}
