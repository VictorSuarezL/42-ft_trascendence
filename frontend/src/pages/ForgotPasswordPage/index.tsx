import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ForgotPasswordPage.module.scss';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:3000/auth/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      console.log('Response:', data);

      if (!response.ok) {
        console.error('Failed:', data.error);
        return;
      }

      navigate('/email-confirmation');
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />

      <section className={styles.card}>
        <div className={styles.icon}>🔮</div>

        <h1 className={styles.title}>Lost your magic?</h1>

        <p className={styles.subtitle}>
          Even the most powerful villains sometimes forget their secrets.
        </p>

        <p className={styles.message}>
          Enter the email associated with your account and we'll send you a link
          to restore access to your kingdom.
        </p>

        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <div className={styles.field}>
            <label htmlFor="email">Email address</label>

            <input
              type="email"
              id="email"
              name="email"
              placeholder="villain@example.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Sending...' : 'Restore my magic'}
          </button>
        </form>

        <div className={styles.divider}>
          <span />
          ✦
          <span />
        </div>

        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate('/')}
        >
          Back to Login
        </button>
      </section>
    </main>
  );
}
