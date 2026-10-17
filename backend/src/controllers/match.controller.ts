import { Request, Response } from 'express';
import { Match, MatchStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { getSessionUser } from '../services/session.services';
import { getRequestedLanguage, type Language } from '../utils/language';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const RECENT_LIMIT = 3;

// Newest first; id breaks ties so pages never skip or repeat a match
const NEWEST_FIRST = [{ createdAt: 'desc' as const }, { id: 'desc' as const }];

function parseStatus(value: unknown): MatchStatus | undefined {
  return Object.values(MatchStatus).find((status) => status === value);
}

function parseLimit(value: unknown): number {
  const limit = Number(value);
  if (!Number.isInteger(limit) || limit < 1) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

async function getRequestUser(req: Request) {
  const sessionId = req.cookies.session;
  return sessionId ? getSessionUser(sessionId) : null;
}

// Adds player names/avatars and translated villain names to each match
async function serializeMatches(matches: Match[], userId: number, language: Language) {
  // playerIds/villainIds are plain arrays (no relations), so look the details up in bulk
  const userIds = [...new Set(matches.flatMap((m) => m.playerIds))];
  const villainIds = [...new Set(matches.flatMap((m) => m.villainIds))];

  const [users, villains] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, displayName: true, login: true, image: true },
    }),
    prisma.villainTranslation.findMany({
      where: { villainId: { in: villainIds }, language },
      select: { villainId: true, name: true },
    }),
  ]);

  const usersById = new Map(users.map((u) => [u.id, u]));
  const villainNames = new Map(villains.map((v) => [v.villainId, v.name]));

  return matches.map((match) => ({
    id: match.id,
    code: match.code,
    status: match.status,
    hostId: match.hostId,
    winnerId: match.winnerId,
    isWinner: match.winnerId === userId,
    createdAt: match.createdAt,
    finishedAt: match.finishedAt,
    players: match.playerIds.map((playerId, index) => {
      const player = usersById.get(playerId);
      const villainId = match.villainIds[index] ?? null;
      return {
        userId: playerId,
        seat: index + 1,
        // null when the user account has since been deleted
        displayName: player ? (player.displayName ?? player.login ?? 'Player') : null,
        image: player?.image ?? null,
        villainId,
        villainName: villainId ? (villainNames.get(villainId) ?? villainId) : null,
      };
    }),
  }));
}

// GET /matches?status=IN_PROGRESS&limit=20&cursor=<id>&lang=es
// Matches the logged-in user played in, newest first. Pass nextCursor back to get the next page.
export async function getMyMatches(req: Request, res: Response) {
  try {
    const user = await getRequestUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const status = parseStatus(req.query.status);
    const limit = parseLimit(req.query.limit);
    const cursor = Number(req.query.cursor);
    const language = getRequestedLanguage(req.query.lang);
    const hasCursor = Number.isInteger(cursor) && cursor > 0;

    const matches = await prisma.match.findMany({
      where: {
        playerIds: { has: user.id },
        ...(status && { status }),
      },
      orderBy: NEWEST_FIRST,
      ...(hasCursor && { cursor: { id: cursor }, skip: 1 }),
      take: limit + 1,
    });

    const hasMore = matches.length > limit;
    const page = hasMore ? matches.slice(0, limit) : matches;

    return res.json({
      matches: await serializeMatches(page, user.id, language),
      nextCursor: hasMore ? page[page.length - 1].id : null,
    });
  } catch (error) {
    console.error('[Matches] Error fetching matches:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /matches/recent?lang=es
// The logged-in user's 3 most recent matches, for the home page.
export async function getMyRecentMatches(req: Request, res: Response) {
  try {
    const user = await getRequestUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const language = getRequestedLanguage(req.query.lang);

    const matches = await prisma.match.findMany({
      where: { playerIds: { has: user.id } },
      orderBy: NEWEST_FIRST,
      take: RECENT_LIMIT,
    });

    return res.json({ matches: await serializeMatches(matches, user.id, language) });
  } catch (error) {
    console.error('[Matches] Error fetching recent matches:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
