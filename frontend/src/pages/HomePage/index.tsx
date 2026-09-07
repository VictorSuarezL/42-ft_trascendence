import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.scss';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';

export function HomePage() {
  const navigate = useNavigate();
  const { language } = useUser();
  const translations = useTranslation(language);

  if (!translations) {
    return <p>...</p>;
  }

  return (
    <div>
      <h1 className={styles.title1}>{translations.homePage.title}</h1>
      <h1 className={styles.title1}>{translations.homePage.title}</h1>
      <h1 className={styles.title1}>{translations.homePage.title}</h1>
      <p>{translations.homePage.description}</p>
      <button
        onClick={() => navigate('/profile')}
        className={styles.customButton}
      >
        {translations.homePage.viewprofile}
      </button>
    </div>
  );
}
