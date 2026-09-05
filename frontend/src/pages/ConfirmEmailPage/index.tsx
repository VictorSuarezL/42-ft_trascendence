import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './ConfirmEmailPage.module.scss';

type ConfirmationStatus =
  | 'loading'
  | 'success'
  | 'expired'
  | 'invalid'
  | 'error';

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<ConfirmationStatus>('loading');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('invalid');
      return;
    }

    async function confirmEmail() {
      try {
        const response = await fetch(
          'http://localhost:3000/auth/confirm-email',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          },
        );

        if (response.ok) {
          setStatus('success');
        } else if (response.status === 410) {
          setStatus('expired');
        } else {
          setStatus('invalid');
        }
      } catch {
        setStatus('error');
      }
    }

    confirmEmail();
  }, [searchParams]);

  const content = {
    loading: {
      icon: '✦',
      title: 'Confirming your email...',
      message:
        'The magic is working. Please wait while we verify your account.',
      className: styles.loading,
    },

    success: {
      icon: '✓',
      title: 'Welcome, Villain!',
      message:
        'Your email has been confirmed successfully. Your journey into the world of Villainous can now begin.',
      className: styles.success,
    },

    expired: {
      icon: '⌛',
      title: 'The spell has expired',
      message:
        'This confirmation link is no longer valid. Please request a new confirmation email.',
      className: styles.warning,
    },

    invalid: {
      icon: '✕',
      title: 'Something went wrong',
      message: 'This confirmation link is invalid or could not be found.',
      className: styles.error,
    },

    error: {
      icon: '!',
      title: 'The magic failed',
      message:
        'We could not confirm your email right now. Please try again later.',
      className: styles.error,
    },
  }[status];

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />

      <section className={styles.card}>
        <div className={`${styles.icon} ${content.className}`}>
          {content.icon}
        </div>

        <h1 className={styles.title}>{content.title}</h1>

        <p className={styles.message}>{content.message}</p>

        {status === 'loading' && (
          <div className={styles.loadingIndicator}>
            <span />
            <span />
            <span />
          </div>
        )}

        {status !== 'loading' && (
          <>
            <div className={styles.divider}>
              <span />
              ✦
              <span />
            </div>

            <button className={styles.button} onClick={() => navigate('/')}>
              Back to Login
            </button>
          </>
        )}
      </section>
    </main>
  );
}
