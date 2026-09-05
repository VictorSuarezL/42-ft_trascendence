import { useNavigate } from 'react-router-dom';
import styles from './SignUpConfirmation.module.scss';

export function SignUpConfirmation() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />

      <section className={styles.card}>
        <div className={styles.icon}>✉</div>

        <h1 className={styles.title}>Almost there...</h1>

        <p className={styles.subtitle}>
          Your journey into the world of Villainous is about to begin.
        </p>

        <p className={styles.message}>
          We have sent a confirmation email to your inbox.
          <br />
          Follow the link in the email to activate your account.
        </p>

        <div className={styles.divider}>
          <span />
          ✦
          <span />
        </div>

        <p className={styles.hint}>
          Didn't receive the email? Check your spam folder.
        </p>

        <button className={styles.button} onClick={() => navigate('/')}>
          Back to Login
        </button>
      </section>
    </main>
  );
}
