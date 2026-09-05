import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import styles from './NotFoundPage.module.scss';
import villain404 from '../../assets/404.webp';

export function NotFoundPage() {
  const navigate = useNavigate();

  const mostrarError = () => {
    console.error('Error: Page not found');
    console.log('Error: Page not found');
    console.warn('Error: Page not found');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <main className={styles.page}>
      <div className={styles.background} />

      <div className={styles.villain}>
        <img src={villain404} alt="Scar confused" aria-hidden="true" />
      </div>

      <div className={styles.overlay} />

      <section className={styles.content}>
        <span className={styles.smallTitle}>THE VILLAIN IS LOST</span>

        <h1 className={styles.errorCode}>404</h1>

        <div className={styles.divider}>
          <span />
          ✦
          <span />
        </div>

        <h2 className={styles.title}>Well, this is awkward...</h2>

        <p className={styles.message}>
          Even the most cunning villains can lose their way. The page you are
          looking for has vanished into the shadows.
        </p>

        <Button
          onClick={handleGoHome}
          className={styles.homeButton}
          onHover={mostrarError}
        >
          Return to the Realm
        </Button>
      </section>

      <div className={styles.cornerTop} />
      <div className={styles.cornerBottom} />
    </main>
  );
}
