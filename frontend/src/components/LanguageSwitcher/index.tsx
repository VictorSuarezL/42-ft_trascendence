import { useUser } from '../../contexts/UserContext';
import { SUPPORTED_LANGUAGES, type Language } from '../../hooks/useTranslation';
import styles from './LanguageSwitcher.module.scss';

const languageOptions: Record<Language, { flag: string; label: string }> = {
  en: { flag: styles.uk, label: 'Change language to Spanish' },
  es: { flag: styles.spain, label: 'Cambiar idioma a francés' },
  fr: { flag: styles.france, label: 'Passer en anglais' },
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useUser();

  const toggleLanguage = () => {
    setLanguage((current) => {
      const nextIndex =
        (SUPPORTED_LANGUAGES.indexOf(current) + 1) % SUPPORTED_LANGUAGES.length;
      return SUPPORTED_LANGUAGES[nextIndex];
    });
  };

  return (
    <button
      type="button"
      className={styles.languageButton}
      onClick={toggleLanguage}
      aria-label={languageOptions[language].label}
      title={languageOptions[language].label}
    >
      <span
        className={`${styles.flag} ${languageOptions[language].flag}`}
        aria-hidden="true"
      />
    </button>
  );
}
