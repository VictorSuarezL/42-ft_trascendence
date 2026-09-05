import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.scss';

function VillainRulesCarousel() {
  const [currentVillain, setCurrentVillain] = useState(0);

  const villains = [
    {
      name: 'Basic Rules',
      icon: '💡',
      rule: 'Learn the basic rules of Villainous and how to play the game.',
      tip: 'Understanding the basic rules is essential to mastering the game.',
    },
    {
      name: 'Scar',
      subtitle: 'The Usurper',
      icon: '♛',
      rule: 'Defeat heroes and gain power to take control of the Pride Lands.',
      tip: 'Manipulate the heroes to strengthen your kingdom.',
    },
    {
      name: 'Maleficent',
      subtitle: 'Mistress of All Evil',
      icon: '✦',
      rule: 'Play curses across the realm and complete your sinister objectives.',
      tip: 'Curses can turn the board in your favour.',
    },
    {
      name: 'Captain Hook',
      subtitle: 'The Pirate',
      icon: '⚓',
      rule: 'Search for Peter Pan and defeat him to achieve your objective.',
      tip: 'Keep an eye on the Fate deck.',
    },
  ];

  const villain = villains[currentVillain];

  const previousVillain = () => {
    setCurrentVillain((current) =>
      current === 0 ? villains.length - 1 : current - 1,
    );
  };

  const nextVillain = () => {
    setCurrentVillain((current) =>
      current === villains.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <div className={styles.villainGuide}>
      <div className={styles.villainGuideHeader}>
        <div>
          <span className={styles.cardEyebrow}>KNOW YOUR ENEMY</span>

          <h3>Villain's guide</h3>
        </div>

        <span className={styles.villainCounter}>
          {String(currentVillain + 1).padStart(2, '0')} /{' '}
          {String(villains.length).padStart(2, '0')}
        </span>
      </div>

      <div className={styles.villainContent}>
        <button
          type="button"
          className={styles.carouselButton}
          onClick={previousVillain}
          aria-label="Previous villain"
        >
          ‹
        </button>

        <div className={styles.villainInfo}>
          <div className={styles.villainIcon}>{villain.icon}</div>

          <div className={styles.villainName}>
            <span>{villain.subtitle}</span>
            <h4>{villain.name}</h4>
          </div>

          <p className={styles.villainRule}>{villain.rule}</p>

          <div className={styles.villainTip}>
            <span>✦</span>
            <p>{villain.tip}</p>
          </div>
        </div>

        <button
          type="button"
          className={styles.carouselButton}
          onClick={nextVillain}
          aria-label="Next villain"
        >
          ›
        </button>
      </div>

      <div className={styles.carouselDots}>
        {villains.map((item, index) => (
          <button
            key={item.name}
            type="button"
            className={`${styles.carouselDot} ${
              index === currentVillain ? styles.carouselDotActive : ''
            }`}
            onClick={() => setCurrentVillain(index)}
            aria-label={`Show ${item.name}`}
          />
        ))}
      </div>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    // Lo conectaremos con el logout real después.
    console.log('Logout');
  };

  return (
    <main className={styles.page}>
      {/* Background */}
      <div className={styles.background} />
      <div className={styles.overlay} />

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}
      >
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>✦</span>

          {menuOpen && <span className={styles.sidebarTitle}>VILLAINOUS</span>}
        </div>

        <nav className={styles.navigation}>
          <button
            className={`${styles.navItem} ${styles.active}`}
            onClick={() => navigate('/home')}
          >
            <span>⌂</span>

            {menuOpen && <span>Kingdom</span>}
          </button>

          <button
            className={styles.navItem}
            onClick={() => navigate('/profile')}
          >
            <span>♟</span>

            {menuOpen && <span>Profile</span>}
          </button>

          <button className={styles.navItem}>
            <span>♟</span>

            {menuOpen && <span>Friends</span>}
          </button>

          <button className={styles.navItem}>
            <span>✉</span>

            {menuOpen && <span>Invitations</span>}
          </button>
        </nav>

        <div className={styles.sidebarBottom}>
          <button className={styles.navItem}>
            <span>⚙</span>

            {menuOpen && <span>Settings</span>}
          </button>

          <button className={styles.navItem} onClick={handleLogout}>
            <span>↪</span>

            {menuOpen && <span>Logout</span>}
          </button>
        </div>

        <button
          className={styles.menuButton}
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '‹' : '☰'}
        </button>
      </aside>

      {/* Main content */}
      <section className={styles.content}>
        {/* Hero */}
        <header className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>WELCOME BACK</span>

            <h1 className={styles.logo}>Villainous</h1>

            <div className={styles.divider}>
              <span />
              ✦
              <span />
            </div>

            <p className={styles.tagline}>Your kingdom awaits.</p>
          </div>

          <div className={styles.heroStatus}>
            <span className={styles.statusDot} />
            <span>ONLINE</span>
          </div>
        </header>

        {/* Create game */}
        <section className={styles.createGame}>
          {/* Create game */}
          <div className={styles.createGameContent}>
            <span className={styles.cardEyebrow}>THE GAME AWAITS</span>

            <h2>Create a new game</h2>

            <p>
              Gather your allies, choose your villain and begin your journey.
            </p>

            <button className={styles.primaryButton}>
              <span>✦</span>
              Create a Game
            </button>
          </div>

          {/* Villain rules carousel */}
          <VillainRulesCarousel />
        </section>

        {/* Dashboard cards */}
        <div className={styles.dashboardGrid}>
          {/* Invitations */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.cardEyebrow}>GAME</span>
                <h2>Invitations</h2>
              </div>

              <span className={styles.badge}>2</span>
            </div>

            <div className={styles.invitation}>
              <div className={styles.avatar}>A</div>

              <div className={styles.invitationInfo}>
                <strong>Alex</strong>
                <span>has invited you to play</span>
              </div>

              <div className={styles.invitationActions}>
                <button className={styles.acceptButton}>Accept</button>
                <button className={styles.rejectButton}>×</button>
              </div>
            </div>

            <div className={styles.invitation}>
              <div className={styles.avatar}>S</div>

              <div className={styles.invitationInfo}>
                <strong>Sarah</strong>
                <span>has invited you to play</span>
              </div>

              <div className={styles.invitationActions}>
                <button className={styles.acceptButton}>Accept</button>
                <button className={styles.rejectButton}>×</button>
              </div>
            </div>
          </section>

          {/* Friends */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.cardEyebrow}>SOCIAL</span>
                <h2>Friends</h2>
              </div>

              <button className={styles.viewButton}>View all →</button>
            </div>

            <div className={styles.friend}>
              <div className={styles.avatar}>S</div>

              <div className={styles.friendInfo}>
                <strong>Sarah</strong>
                <span>Online</span>
              </div>

              <span className={`${styles.presence} ${styles.online}`} />
            </div>

            <div className={styles.friend}>
              <div className={styles.avatar}>A</div>

              <div className={styles.friendInfo}>
                <strong>Alex</strong>
                <span>Playing a game</span>
              </div>

              <span className={`${styles.presence} ${styles.online}`} />
            </div>

            <div className={styles.friend}>
              <div className={styles.avatar}>J</div>

              <div className={styles.friendInfo}>
                <strong>John</strong>
                <span>Offline</span>
              </div>

              <span className={styles.presence} />
            </div>
          </section>
        </div>

        {/* Statistics */}
        <section className={styles.statistics}>
          <div className={styles.stat}>
            <span>17</span>
            <small>GAMES PLAYED</small>
          </div>

          <div className={styles.statDivider} />

          <div className={styles.stat}>
            <span>9</span>
            <small>VICTORIES</small>
          </div>

          <div className={styles.statDivider} />

          <div className={styles.stat}>
            <span>53%</span>
            <small>WIN RATE</small>
          </div>
        </section>
      </section>
    </main>
  );
}
