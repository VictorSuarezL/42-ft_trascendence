import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useTranslation } from '../../hooks/useTranslation';
import defaultProfileImage from '../../assets/defaultProfile.webp';
import styles from './MyGamesPage.module.scss';

type MatchStatus = 'IN_PROGRESS' | 'FINISHED';
type Filter = MatchStatus | 'ALL';

interface MatchPlayer {
  userId: number;
  seat: number;
  displayName: string | null;
  image: string | null;
  villainId: string | null;
  villainName: string | null;
}

interface MatchItem {
  id: number;
  code: string;
  status: MatchStatus;
  hostId: number;
  winnerId: number | null;
  isWinner: boolean;
  createdAt: string;
  finishedAt: string | null;
  players: MatchPlayer[];
}

interface MatchesResponse {
  matches: MatchItem[];
  nextCursor: number | null;
}

const PAGE_SIZE = 20;

// Same accent colors as the villain guide pages
const VILLAIN_COLORS: Record<string, string> = {
  scar: '#d4af37',
  maleficent: '#1d8622',
  'captain-hook': '#b3162b',
  hades: '#3b6ea5',
};

const getImageUrl = (image: string | null) => {
  if (!image) return defaultProfileImage;
  if (image.startsWith('http')) return image;
  return `/api${image}`;
};

async function fetchMatches(filter: Filter, language: string, cursor?: number): Promise<MatchesResponse> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE), lang: language });
  if (filter !== 'ALL') params.set('status', filter);
  if (cursor) params.set('cursor', String(cursor));

  const res = await fetch(`/api/matches?${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function MyGamesPage() {
  const navigate = useNavigate();
  const { user, language } = useUser();
  const translations = useTranslation(language, 'myGamesPage');

  const [filter, setFilter] = useState<Filter>('ALL');
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchMatches(filter, language)
      .then((data) => {
        if (cancelled) return;
        setMatches(data.matches);
        setNextCursor(data.nextCursor);
        setFailed(false);
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filter, language, reloadKey]);

  const changeFilter = (next: Filter) => {
    if (next === filter) return;
    setLoading(true);
    setMatches([]);
    setFilter(next);
  };

  const retry = () => {
    setLoading(true);
    setFailed(false);
    setReloadKey((k) => k + 1);
  };

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const data = await fetchMatches(filter, language, nextCursor);
      setMatches((prev) => [...prev, ...data.matches]);
      setNextCursor(data.nextCursor);
    } catch {
      setFailed(true);
    } finally {
      setLoadingMore(false);
    }
  };

  if (!translations) return <div className={styles.page} />;

  const t = translations.myGamesPage;

  const filters: { value: Filter; label: string }[] = [
    { value: 'ALL', label: t.filterAll },
    { value: 'IN_PROGRESS', label: t.filterInProgress },
    { value: 'FINISHED', label: t.filterFinished },
  ];

  const statusLabel: Record<MatchStatus, string> = {
    IN_PROGRESS: t.statusInProgress,
    FINISHED: t.statusFinished,
  };

  const dateFormat = new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate('/home')}>
          {t.back}
        </button>
        <h1 className={styles.title}>{t.title}</h1>
      </div>

      <div className={styles.filters} role="tablist">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            className={`${styles.filter} ${filter === f.value ? styles.filterActive : ''}`}
            onClick={() => changeFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className={styles.list}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${styles.card} ${styles.skeleton}`} />
          ))}
        </div>
      )}

      {!loading && failed && matches.length === 0 && (
        <div className={styles.emptyState}>
          <p>{t.loadError}</p>
          <button type="button" className={styles.primary} onClick={retry}>
            {t.retry}
          </button>
        </div>
      )}

      {!loading && !failed && matches.length === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">♛</span>
          <h2>{t.emptyTitle}</h2>
          <p>{t.emptyText}</p>
          <button type="button" className={styles.primary} onClick={() => navigate('/home')}>
            {t.emptyCta}
          </button>
        </div>
      )}

      {!loading && matches.length > 0 && (
        <>
          <ul className={styles.list}>
            {matches.map((match) => {
              const result =
                match.status === 'FINISHED' && match.winnerId !== null ? (match.isWinner ? 'won' : 'lost') : null;

              return (
                <li
                  key={match.id}
                  className={`${styles.card} ${result ? styles[result] : ''} ${
                    match.status === 'IN_PROGRESS' ? styles.live : ''
                  }`}
                >
                  <div className={styles.meta}>
                    <span className={`${styles.status} ${styles[`status_${match.status}`]}`}>
                      {statusLabel[match.status]}
                    </span>
                    <span className={styles.code}>#{match.code}</span>
                    <time className={styles.date} dateTime={match.createdAt}>
                      {dateFormat.format(new Date(match.createdAt))}
                    </time>
                  </div>

                  <ul className={styles.players}>
                    {match.players.map((p) => {
                      const isMe = p.userId === user?.id;
                      const isWinner = match.winnerId === p.userId;
                      return (
                        <li
                          key={p.seat}
                          className={`${styles.player} ${isMe ? styles.me : ''}`}
                          style={{ '--accent': VILLAIN_COLORS[p.villainId ?? ''] ?? '#d4a52c' } as CSSProperties}
                        >
                          <img className={styles.avatar} src={getImageUrl(p.image)} alt="" />
                          <span className={styles.playerText}>
                            <span className={styles.playerName}>
                              {isWinner && <span className={styles.crown} aria-hidden="true">♛ </span>}
                              {isMe ? t.you : (p.displayName ?? t.deletedUser)}
                            </span>
                            {p.villainName && <span className={styles.villain}>{p.villainName}</span>}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className={styles.outcome}>
                    {result && <span className={styles.result}>{result === 'won' ? t.won : t.lost}</span>}
                  </div>
                </li>
              );
            })}
          </ul>

          {nextCursor && (
            <div className={styles.more}>
              <button type="button" className={styles.secondary} disabled={loadingMore} onClick={() => void loadMore()}>
                {t.loadMore}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
