import { Request, Response } from 'express';
import { mapFortyTwoUser } from '../utils/mapUser';
import { createSession } from '../services/session.services';
import { prisma } from '../utils/prisma';

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
