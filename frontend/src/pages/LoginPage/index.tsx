import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.scss';
import { useState } from 'react';
import { useUser } from '../../contexts/UserContext';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useUser();
  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        return;
      }

      console.log('Login successful:', data);
      setUser(data.user);
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  function handleResetPassword() {
    navigate('/forgot-password');
  }

  return (
    <main className={styles.page}>
      <video className={styles.backgroundVideo} autoPlay loop muted playsInline>
        <source src="/login.mp4" type="video/mp4" />
      </video>

      <div className={styles.overlay} />

      <section className={styles.loginCard}>
        <h1>Welcome back</h1>
        <p>Please log in to continue.</p>

        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            handleLogin();
          }}
        >
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.loginButton}>
            Log in
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <a
          href="http://localhost:3000/auth/42"
          className={styles.fortyTwoButton}
        >
          Continue with 42
        </a>
        <div className={styles.signupPrompt}>
          <p className={styles.signupText}>
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')}>Sign up</button>
          </p>
          <p className={styles.signupText}>
            Forgot your password?{' '}
            <button onClick={handleResetPassword}>Reset it</button>
          </p>
        </div>
      </section>
    </main>
  );
}
