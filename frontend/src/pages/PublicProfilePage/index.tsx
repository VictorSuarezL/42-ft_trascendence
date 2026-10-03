import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './PublicProfilePage.module.scss';

type PublicUser = {
  id: number;
  login: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  image: string | null;
};

type PublicProfileResponse = {
  user: PublicUser;
  isOnline: boolean;
};

const SOCKET_EVENTS = {
  SOCIAL: {
    FRIEND_REQUEST: 'social.friend.request',
    PRESENCE_CHANGED: 'social.presence.changed',
  },
} as const;

const getImageUrl = (image?: string | null) => {
  if (!image) {
    return null;
  }

  if (image.startsWith('http')) {
    return image;
  }

  return `http://localhost:3000${image}`;
};

export function PublicProfilePage() {
  const { login } = useParams<{ login: string }>();
  const navigate = useNavigate();
  const { user: currentUser, socket } = useUser();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [friendRequested, setFriendRequested] = useState(false);
  const [loading, setLoading] = useState(true);
  const profileLogin = login ?? '';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `/api/users/${encodeURIComponent(profileLogin)}`,
        );

        if (!response.ok) {
          setUser(null);
          return;
        }

        const userData = (await response.json()) as PublicProfileResponse;
        setUser(userData.user);
        setIsOnline(userData.isOnline);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (profileLogin) {
      fetchUser();
    }
  }, [profileLogin]);

  useEffect(() => {
    if (!socket || !user) {
      return;
    }

    const handlePresenceChanged = ({
      userId,
      status,
    }: {
      userId: number;
      status: 'online' | 'offline';
    }) => {
      if (userId === user.id) {
        setIsOnline(status === 'online');
      }
    };

    socket.on(SOCKET_EVENTS.SOCIAL.PRESENCE_CHANGED, handlePresenceChanged);

    return () => {
      socket.off(SOCKET_EVENTS.SOCIAL.PRESENCE_CHANGED, handlePresenceChanged);
    };
  }, [socket, user]);

  const handleAddFriend = () => {
    if (!socket || !user || friendRequested || currentUser?.id === user.id) {
      return;
    }

    socket.emit(SOCKET_EVENTS.SOCIAL.FRIEND_REQUEST, {
      userId: user.id,
    });

    setFriendRequested(true);
  };

  return (
    <div className={styles.publicProfilePage}>
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <div className={styles.userInfo}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              {getImageUrl(user.image) ? (
                <img
                  className={styles.profileImage}
                  src={getImageUrl(user.image) ?? undefined}
                  alt={`Profile of ${user.displayName ?? user.login}`}
                />
              ) : (
                <div className={styles.profileFallback}>
                  {(user.displayName ?? user.login ?? '?').slice(0, 1)}
                </div>
              )}

              <span
                className={`${styles.presenceDot} ${
                  isOnline ? styles.online : styles.offline
                }`}
                aria-label={isOnline ? 'Online' : 'Offline'}
                title={isOnline ? 'Online' : 'Offline'}
              />
            </div>
          </div>

          <div className={styles.presenceRow}>
            <span
              className={`${styles.presenceBadge} ${
                isOnline ? styles.onlineBadge : styles.offlineBadge
              }`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className={styles.fields}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Login</span>
              <span className={styles.fieldValue}>{user.login}</span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Email</span>
              <span className={styles.fieldValue}>{user.email}</span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>First Name</span>
              <span className={styles.fieldValue}>{user.firstName}</span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Last Name</span>
              <span className={styles.fieldValue}>{user.lastName}</span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Display Name</span>
              <span className={styles.fieldValue}>{user.displayName}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleAddFriend}
              disabled={
                !socket || friendRequested || currentUser?.id === user.id
              }
            >
              {friendRequested ? 'Friend request sent' : 'Add friend'}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h2>Profile not found</h2>
          <p>This user does not exist or the profile is unavailable.</p>
          <button type="button" onClick={() => navigate('/home')}>
            Go Home
          </button>
        </div>
      )}
    </div>
  );
}
