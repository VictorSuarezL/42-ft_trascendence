import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.scss';
import { Button } from '../../components/Button';
import { useEffect, useState } from 'react';
import { createSocket } from '../../utils/socket';

export function HomePage() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const socket = createSocket();

    socket.connect();

    socket.on('backend-message', (data) => {
      setMessage(data.message);
    });

    return () => {
      socket.off('backend-message');
    };
  }, []);

  const navigate = useNavigate();
  const sendSocketMessage = () => {
    const socket = createSocket();
    socket.connect();
    socket.emit('frontend-message', { message: 'Hello from the frontend!' });
  };
  return (
    <main className={styles.home}>
      <h1>Home</h1>
      <p>This is the first route of the project.</p>
      <Button onClick={() => navigate('/test')} className={styles.customBtn}>
        Go to Test
      </Button>
      <p> Want to try the backend?</p>
      <Button onClick={() => navigate('/test1')} className={styles.customBtn}>
        Go to Test1
      </Button>
      <p>Message from backend through Socket.IO: {message}</p>
      <Button onClick={sendSocketMessage} className={styles.customBtn}>
        Send socket message
      </Button>
    </main>
  );
}
