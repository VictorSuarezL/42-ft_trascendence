import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './ProfilePage.module.scss';

export function ProfilePage() {
  const { user, loading, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <main className={styles.loading}>
        <span className={styles.loadingIcon}>✦</span>
        <span>Entering your realm...</span>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.loading}>
        <span>Unable to load your profile.</span>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      {/* Background */}
      <div className={styles.background} />
      <div className={styles.overlay} />

      {/* Back */}
      <button
        className={styles.backButton}
        onClick={() => navigate('/home')}
        type="button"
      >
        <span>←</span>
        <span>Kingdom</span>
      </button>

      {/* Main profile */}
      <section className={styles.profile}>
        {/* Header */}
        <header className={styles.header}>
          <span className={styles.eyebrow}>THE VILLAIN'S DOSSIER</span>

          <h1>Profile</h1>

          <div className={styles.divider}>
            <span />
            ✦
            <span />
          </div>

          <p>Know thy villain.</p>
        </header>

        {/* Profile card */}
        <section className={styles.profileCard}>
          {/* Avatar */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarGlow} />

            <div className={styles.avatarWrapper}>
              {user.image ? (
                <img
                  className={styles.avatar}
                  src={user.image}
                  alt={`Profile of ${user.displayName}`}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user.displayName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <span className={styles.onlineStatus}>
              <span />
              ONLINE
            </span>
          </div>

          {/* Identity */}
          <div className={styles.identity}>
            <span className={styles.identityLabel}>YOUR IDENTITY</span>

            <h2>{user.displayName}</h2>

            <p className={styles.login}>@{user.login}</p>

            <div className={styles.identityDivider} />

            <div className={styles.details}>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>FIRST NAME</span>
                <span className={styles.detailValue}>
                  {user.firstName || '—'}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.detailLabel}>LAST NAME</span>
                <span className={styles.detailValue}>
                  {user.lastName || '—'}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.detailLabel}>EMAIL</span>
                <span className={styles.detailValue}>{user.email}</span>
              </div>

              <div className={styles.detail}>
                <span className={styles.detailLabel}>VILLAIN ID</span>
                <span className={styles.detailValue}>#{user.id}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className={styles.actions}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => {
              console.log('Edit profile');
            }}
          >
            <span>✦</span>
            Edit Profile
          </button>

          <button
            className={styles.logoutButton}
            type="button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Leave the Realm
          </button>
        </section>

        {/* Decorative quote */}
        <div className={styles.quote}>
          <span>“</span>
          <p>Every villain has a story.</p>
          <span>”</span>
        </div>
      </section>
    </main>
  );
}
