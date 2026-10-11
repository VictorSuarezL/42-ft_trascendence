import { useNavigate } from 'react-router-dom';
import styles from './SignUpConfirmation.module.scss';

export function SignUpConfirmation() {
  const navigate = useNavigate();
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>✉</div>
        <h1 className={styles.title}>Check your inbox</h1>
        <p className={styles.text}>
          We've sent a confirmation link to your email address. Click it to
          activate your account.
        </p>
        <p className={styles.subtext}>
          Didn't receive it? Check your spam folder.
        </p>
        <button className={styles.button} onClick={() => navigate('/')}>
          Back to login
        </button>
      </div>
    </main>
  );
}
