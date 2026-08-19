import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.scss';

export function HomePage() {
  const navigate = useNavigate();
  return (
    <div>
      <h1 className={styles.title1}>Welcome to the Home Page!</h1>
      <h1 className={styles.title1}>Welcome to the Home Page!</h1>
      <h1 className={styles.title1}>Welcome to the Home Page!</h1>
      <p>This is the main content of the home page.</p>
      <button
        onClick={() => navigate('/profile')}
        className={styles.customButton}
      >
        View Profile
      </button>
    </div>
  );
}
