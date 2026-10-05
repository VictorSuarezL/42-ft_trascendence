import { useNavigate } from 'react-router-dom';
import styles from './Character.module.scss';
import scarMain from '../../../assets/ScarMain.webp';

export function ComoJugar() {
  const navigate = useNavigate();
  return (
	<main className={styles.villainPage}>
	  <section
		className={styles.villain}
		style={{ backgroundImage: `url(${scarMain})` }}
	  >
		<div className={styles.villainContent}>
		  <div className={styles.villainInfo}>
			<button
			  onClick={() => navigate('/home')}
			  className={styles.customButton}
			>
			  BACK TO HOME
			</button>

			<h1>SCAR</h1>

			<p className={styles.subtitle}>
			  "Larga vida al rey"
			</p>

		  </div>

		  <div className={styles.objective}>
			<h2>♛ YOUR OBJECTIVE</h2>

			<p>
			  Be the first Villain to have control of 4 Regions at the end of
			  your turn.
			</p>
		  </div>
		</div>
	  </section>

	  <section className={styles.realm}>
		<header className={styles.realmHeader}>
		  <span className={styles.icon}>✦</span>

		  <div>
			<h2>THE REALM</h2>
			<p>The realm is divided into 4 locations.</p>
			<span>From left to right:</span>
		  </div>
		</header>

		<div className={styles.realmContent}>{/* Aquí irá el tablero */}</div>
	  </section>
	</main>
  );
}
