import { useNavigate } from 'react-router-dom';

import styles from './HomePage.module.scss';

import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import { HowToPlayCarousel } from '../../components/HowToPlayCarousel/HowToPlayCarousel';

export function HomePage() {
  const navigate = useNavigate();

  const { language } = useUser();

  const translations = useTranslation(language, 'homePage,cardTypes');

  if (!translations) {
    return <p>...</p>;
  }

  return (
    <div className={styles.home}>
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span>VILLAINOUS</span>
        </div>

        <div className={styles.profile}>
          <div className={styles.profileImage}>👤</div>

          <div>
            <p className={styles.profileName}>SARA</p>

            <p className={styles.profileStatus}>ONLINE</p>
          </div>
        </div>

        <nav className={styles.navigation}>
          <button className={styles.navItem}>
            <span>♜</span>
            {translations.homePage.home}
          </button>

          <button className={styles.navItem}>
            <span>♟</span>
            {translations.homePage.friends}
          </button>

          <button className={styles.navItem}>
            <span>✉</span>
            {translations.homePage.chat}
          </button>

          <button
            className={styles.navItem}
            onClick={() => navigate('/profile')}
          >
            <span>♙</span>
            {translations.homePage.profile}
          </button>

          <button className={styles.navItem}>
            <span>♢</span>
            {translations.homePage.notifications}
          </button>

          <button className={styles.navItem}>
            <span>♛</span>
            {translations.homePage.myGames}
          </button>
        </nav>

        <button className={styles.logout}>
          <span>↪</span>
          {translations.homePage.logout}
        </button>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className={styles.main}>
        {/* =================================================
            HERO
        ================================================= */}

        <section className={styles.hero}>

          <div className={styles.heroOverlay} />

          <div className={styles.heroContent}>
            {/* =============================================
                WELCOME
            ============================================= */}

            <section className={styles.welcome}>
              <div>
                <p className={styles.eyebrow}>THE REALM AWAITS</p>

                <h1>
                  WELCOME BACK, <span>SARA</span>
                </h1>

                <p className={styles.welcomeSubtitle}>
                  What shall we play today?
                </p>
              </div>
            </section>

            {/* =============================================
                CREATE / JOIN
            ============================================= */}

            <section className={styles.actions}>
              <button
                className={styles.createGame}
                onClick={() => navigate('/play')}
              >
                <span className={styles.actionIcon}>+</span>

                <span>
                  <strong>CREATE GAME</strong>

                  <small>Start a new game</small>
                </span>
              </button>

              <button
                className={styles.joinGame}
                onClick={() => navigate('/play')}
              >
                <span className={styles.actionIcon}>👥</span>

                <span>
                  <strong>JOIN GAME</strong>

                  <small>Join an existing game</small>
                </span>
              </button>
            </section>
          </div>
        </section>

        {/* =================================================
            HOW TO PLAY
        ================================================= */}

        <h2 className={styles.howToPlayTitle}>LEARN HOW TO PLAY</h2>

        {/* =================================================
            CAROUSEL

            Se mantiene exactamente como lo tienes.
        ================================================= */}

        <HowToPlayCarousel />

        {/* =================================================
            YOUR GAMES
        ================================================= */}

        <section className={styles.games}>
          <div className={styles.gamesHeader}>
            <div>
              <p className={styles.eyebrow}>YOUR BATTLES</p>

              <h2>YOUR GAMES</h2>
            </div>

            <button className={styles.viewAll}>VIEW ALL →</button>
          </div>

          <div className={styles.gameList}>
            {/* BACKEND:
                Estos datos son de prueba.
            */}

            <article className={styles.game}>
              <div className={styles.gameIcon}>⚔</div>

              <div className={styles.gameInfo}>
                <h3>The Dark Realm</h3>

                <p>Playing as Scar</p>
              </div>

              <div className={styles.status}>YOUR TURN</div>

              <button className={styles.continue}>→</button>
            </article>

            <article className={styles.game}>
              <div className={styles.gameIcon}>♛</div>

              <div className={styles.gameInfo}>
                <h3>Villainous Battle</h3>

                <p>Playing as Maleficent</p>
              </div>

              <div className={styles.status}>WAITING</div>

              <button className={styles.continue}>→</button>
            </article>

            <article className={styles.game}>
              <div className={styles.gameIcon}>⌛</div>

              <div className={styles.gameInfo}>
                <h3>The Underworld</h3>

                <p>Playing as Hades</p>
              </div>

              <div className={styles.status}>WAITING</div>

              <button className={styles.continue}>→</button>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
