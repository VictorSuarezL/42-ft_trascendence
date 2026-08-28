import { useUser } from '../../contexts/UserContext';
import styles from './LanguageSwitcher.module.scss';

export function LanguageSwitcher() {
  const { language, setLanguage } = useUser();

  const toggleLanguage = () => {
    if (language === 'es') {
      setLanguage('en');
    } else if (language === 'en') {
      setLanguage('fr');
    } else {
      setLanguage('es');
    }
  };

  const languageLabel = language.toUpperCase();

  return (
    <button
      type="button"
      className={styles.languageButton}
      onClick={toggleLanguage}
      aria-label={`Change language. Current language: ${languageLabel}`}
    >
      <span
        className={`${styles.flag} ${
          language === 'es'
            ? styles.spain
            : language === 'en'
              ? styles.uk
              : styles.france
        }`}
      />

      <span className={styles.languageCode}>{languageLabel}</span>

      <span className={styles.chevron}>⌄</span>
    </button>
  );
}
