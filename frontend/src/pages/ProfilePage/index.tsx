import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './ProfilePage.module.scss';
import { useToast } from '../../contexts/ToastContext';

export function ProfilePage() {
  const { user, loading, logout } = useUser();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  console.log('User from context:', user);
  if (loading) {
    return <div>Loading...</div>;
  }

  const { showToast } = useToast();

  return (
    <div className={styles.profile}>
      <h1>Welcome to the Profile Page!</h1>
      <div className={styles.userInfo}>
        <span>
          {user?.image && (
            <img
              className={styles.profileImage}
              src={user.image}
              alt={`Profile of ${user.displayName}`}
            />
          )}
        </span>
        <span>ID: {user?.id}</span>
        <span>Login: {user?.login}</span>
        <span>Email: {user?.email}</span>
        <span>First Name: {user?.firstName}</span>
        <span>Last Name: {user?.lastName}</span>
        <span>Display Name: {user?.displayName}</span>
        <button onClick={handleLogout}>Log out!</button>
        <button
          onClick={() =>
            showToast({
              message: 'El juego se ha creado correctamente.',
              type: 'info',
              location: 'TOP-RIGHT',
              durationMs: 3000,
            })
          }
        >
          Mostrar toast info
        </button>
        <button
          onClick={() =>
            showToast({
              message: 'El juego se ha creado correctamente.',
              type: 'success',
              location: 'TOP-RIGHT',
              durationMs: 3000,
            })
          }
        >
          Mostrar toast success
        </button>
        <button
          onClick={() =>
            showToast({
              message: 'El juego se ha creado correctamente.',
              type: 'error',
              location: 'TOP-RIGHT',
              durationMs: 3000,
            })
          }
        >
          Mostrar toast error
        </button>
      </div>
      *{' '}
    </div>
  );
}
