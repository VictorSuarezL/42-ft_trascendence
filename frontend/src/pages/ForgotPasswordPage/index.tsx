import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ForgotPasswordPage.module.scss';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!email) { setError('Please enter your email address.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong.');
        return;
      }
      setSent(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={`${styles.icon} ${styles.iconSuccess}`}>✉</div>
          <h1 className={styles.title}>Check your inbox</h1>
          <p className={styles.text}>
            If an account exists for <strong>{email}</strong>, we've sent a
            password reset link. It expires in 1 hour.
          </p>
          <p className={styles.subtext}>Check your spam folder if it doesn't arrive.</p>
          <button className={styles.button} onClick={() => navigate('/')}>
            Back to login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={`${styles.icon} ${styles.iconNeutral}`}>🔑</div>
        <h1 className={styles.title}>Forgot password?</h1>
        <p className={styles.text}>
          Enter your email and we'll send you a link to reset your password.
        </p>
        <form
          className={styles.form}
          onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            autoComplete="email"
            autoFocus
            className={styles.input}
          />
          {error && <p className={styles.errorMsg}>{error}</p>}
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? '…' : 'Send reset link'}
          </button>
        </form>
        <button className={styles.backLink} onClick={() => navigate('/')}>
          Back to login
        </button>
      </div>
    </main>
  );
}
