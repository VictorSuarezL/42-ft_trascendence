import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './ConfirmEmailPage.module.scss';
import { apiUrl } from '../../lib/api';

type Status = 'loading' | 'success' | 'expired' | 'invalid' | 'error';

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('invalid');
      return;
    }

    async function confirmEmail() {
      try {
        const response = await fetch(apiUrl('/api/auth/confirm-email'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

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

  const content: Record<Status, { icon: string; iconClass: string; title: string; text: string }> = {
    loading: { icon: '⏳', iconClass: styles.iconNeutral, title: 'Confirming your email…', text: 'Please wait while we verify your link.' },
    success: { icon: '✓', iconClass: styles.iconSuccess, title: 'Email confirmed!', text: 'Your account is now active. You may log in.' },
    expired: { icon: '⏱', iconClass: styles.iconError, title: 'Link expired', text: 'This confirmation link has expired. Please sign up again.' },
    invalid: { icon: '✕', iconClass: styles.iconError, title: 'Invalid link', text: 'This confirmation link is not valid.' },
    error: { icon: '!', iconClass: styles.iconError, title: 'Something went wrong', text: 'We could not confirm your email. Please try again.' },
  };

  const { icon, iconClass, title, text } = content[status];

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={`${styles.icon} ${iconClass}`}>{icon}</div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{text}</p>
        {status !== 'loading' && (
          <button className={styles.button} onClick={() => navigate('/')}>
            Back to login
          </button>
        )}
      </div>
    </main>
  );
}
