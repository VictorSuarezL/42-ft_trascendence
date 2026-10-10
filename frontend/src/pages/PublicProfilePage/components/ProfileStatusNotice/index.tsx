import styles from './ProfileStatusNotice.module.scss';

type ProfileStatusNoticeProps = {
  isOnline: boolean;
};

export function ProfileStatusNotice({ isOnline }: ProfileStatusNoticeProps) {
  return (
    <div
      className={`${styles.notice} ${isOnline ? styles.online : styles.offline}`}
      role="status"
      aria-live="polite"
    >
      <strong>{isOnline ? 'Online now' : 'Offline right now'}</strong>
      <p>
        {isOnline
          ? 'This user is online and can receive your friend request immediately.'
          : 'This user is offline, but the request will be waiting for them.'}
      </p>
    </div>
  );
}
