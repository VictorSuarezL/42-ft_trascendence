import { useNavigate } from 'react-router-dom';
import { useViewPortWidth } from '../../utils/useViewPortWidth';
import styles from './TestPage.module.scss';
import { Button } from '../../components/Button';
import { getRequest } from '../../utils/api';
import { useState } from 'react';

export const TestPage = () => {
  const { width, isMobile, isTablet, isDesktop } = useViewPortWidth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  async function fetchData() {
    try {
      const data = await getRequest<{ status: string }>('/api/test');
      setMessage(data.status);
    } catch (error) {
      console.error(error);
      setMessage('request failed');
    }
  }
  return (
    <div className={styles.test}>
      <h1>Test</h1>
      <p>This is the test route of the project.</p>
      <p>Viewport width: {width}px</p>
      {isMobile && <p>This is a mobile view.</p>}
      {isTablet && <p>This is a tablet view.</p>}
      {isDesktop && <p>This is a desktop view.</p>}
      {isDesktop ? <p>Desktop view</p> : <p>Not a desktop view</p>}
      <Button onClick={() => navigate('/')} className={styles.snakeBtn}>
        Go to Home
      </Button>
      <div>
        <button onClick={fetchData} className={styles.snakeBtn}>
          Call backend
        </button>
        <p>{message}</p>
      </div>
    </div>
  );
};
