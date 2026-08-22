import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import styles from './NotFoundPage.module.scss';

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
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Button
        onClick={() => navigate('/')}
        className={styles.homeButton}
        onHover={mostrarError}
      >
        Go Home
      </Button>
    </div>
  );
}
