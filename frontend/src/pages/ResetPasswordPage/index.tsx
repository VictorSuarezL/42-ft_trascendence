import { FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './ResetPasswordPage.module.scss';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!token) { setError('Invalid or missing reset token.'); return; }
    if (!password || !confirmPassword) { setError('Please fill in both fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Could not reset your password.'); return; }
      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={`${styles.icon} ${styles.iconSuccess}`}>✓</div>
          <h1 className={styles.title}>Password reset</h1>
          <p className={styles.text}>Your password has been successfully changed.</p>
          <p className={styles.subtext}>Welcome back, villain.</p>
          <button className={styles.button} onClick={() => navigate('/')}>
            Go to login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset password</h1>
        <p className={styles.text}>Enter your new password below.</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            autoComplete="new-password"
            autoFocus
            disabled={loading}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
            autoComplete="new-password"
            disabled={loading}
            className={styles.input}
          />
          {error && <p className={styles.errorMsg}>{error}</p>}
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? '…' : 'Reset password'}
          </button>
        </form>
        <button className={styles.backLink} onClick={() => navigate('/')}>
          Back to login
        </button>
      </div>
    </main>
  );
}
