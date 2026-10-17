import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TranslationData } from '../../types/types';
import styles from './HomePage.module.scss';

interface RecentMatch {
  id: number;
  code: string;
  status: 'IN_PROGRESS' | 'FINISHED';
  winnerId: number | null;
  isWinner: boolean;
  players: { userId: number; displayName: string | null; villainName: string | null }[];
}

interface RecentGamesProps {
  userId: number | undefined;
  language: string;
  t: TranslationData['myGamesPage'];
}

export function RecentGames({ userId, language, t }: RecentGamesProps) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<RecentMatch[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/matches/recent?lang=${encodeURIComponent(language)}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { matches: [] }))
      .then((data: { matches: RecentMatch[] }) => !cancelled && setMatches(data.matches))
      .catch(() => !cancelled && setMatches([]));
    return () => {
      cancelled = true;
    };
  }, [language]);

  if (matches === null) {
    return <div className={styles.gameList} />;
  }

  if (matches.length === 0) {
    return (
      <div className={styles.gameList}>
        <article className={styles.game}>
          <div className={styles.gameIcon}>♛</div>
          <div className={styles.gameInfo}>
            <h3>{t.emptyTitle}</h3>
            <p>{t.emptyText}</p>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className={styles.gameList}>
      {matches.map((match) => {
        const me = match.players.find((p) => p.userId === userId);
        const rivals = match.players
          .filter((p) => p.userId !== userId)
          .map((p) => p.displayName ?? t.deletedUser)
          .join(', ');

        const finished = match.status === 'FINISHED';
        const result = finished && match.winnerId !== null ? (match.isWinner ? 'won' : 'lost') : null;
        const icon = result === 'won' ? '♛' : result === 'lost' ? '✝' : '⚔';
        const statusText = result === 'won' ? t.won : result === 'lost' ? t.lost : t.statusInProgress;

        const subtitle = [
          me?.villainName && t.playingAs.replace('{villain}', me.villainName),
          rivals && t.against.replace('{names}', rivals),
        ]
          .filter(Boolean)
          .join(' · ');

        return (
          <article key={match.id} className={styles.game}>
            <div className={styles.gameIcon}>{icon}</div>

            <div className={styles.gameInfo}>
              <h3>{t.gameCode.replace('{code}', match.code)}</h3>
              <p>{subtitle}</p>
            </div>

            <div className={`${styles.status} ${result ? styles[result] : ''}`}>{statusText.toUpperCase()}</div>

            <button className={styles.continue} onClick={() => navigate('/my-games')} aria-label={t.title}>
              →
            </button>
          </article>
        );
      })}
    </div>
  );
}
