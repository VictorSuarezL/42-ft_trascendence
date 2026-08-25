import { FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './ResetPasswordPage.module.scss';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setStatus('loading');

      const response = await fetch(
        'http://localhost:3000/auth/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setError(data.error || 'Could not reset your password.');
        return;
      }

      setStatus('success');
    } catch (error) {
      console.error('Reset password error:', error);

      setStatus('error');
      setError('Something went wrong. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <main className={styles.page}>
        <video
          className={styles.backgroundVideo}
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/login.mp4" type="video/mp4" />
        </video>

        <div className={styles.overlay} />

        <section className={styles.card}>
          <h1>Password reset</h1>

          <p>Your password has been successfully changed.</p>

          <button
            type="button"
            className={styles.button}
            onClick={() => navigate('/')}
          >
            Back to login
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <video className={styles.backgroundVideo} autoPlay loop muted playsInline>
        <source src="/login.mp4" type="video/mp4" />
      </video>

      <div className={styles.overlay} />

      <section className={styles.card}>
        <h1>Reset your password</h1>

        <p>Enter your new password below.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="password">New password</label>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={status === 'loading'}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword">Confirm new password</label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={status === 'loading'}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.button}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate('/')}
        >
          Back to login
        </button>
      </section>
    </main>
  );
}
