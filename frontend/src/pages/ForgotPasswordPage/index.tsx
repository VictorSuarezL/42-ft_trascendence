import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ForgotPasswordPage.module.scss';
import { apiUrl } from '../../lib/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(apiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (error) {
      console.error('Request failed:', error);
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>✉</span>
        </div>

        {sent ? (
          <>
            <h1 className={styles.title}>Check your inbox</h1>
            <p className={styles.text}>
              If an account exists for <strong>{email}</strong>, we sent a
              password reset link.
            </p>
            <button className={styles.button} onClick={() => navigate('/')}>
              Back to login
            </button>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Forgot password?</h1>
            <p className={styles.text}>
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button type="submit" className={styles.button} disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <button
              type="button"
              className={styles.backLink}
              onClick={() => navigate('/')}
            >
              ← Back to login
            </button>
          </>
        )}
      </div>
    </main>
  );
}
