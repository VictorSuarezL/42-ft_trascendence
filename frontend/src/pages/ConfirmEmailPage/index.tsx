import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './ConfirmEmailPage.module.scss';

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'expired' | 'invalid' | 'error'>('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('invalid'); return; }

    async function confirm() {
      try {
        const res = await fetch('/api/auth/confirm-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (res.ok) setStatus('success');
        else if (res.status === 410) setStatus('expired');
        else setStatus('invalid');
      } catch {
        setStatus('error');
      }
    }

    void confirm();
  }, [searchParams]);

  const content: Record<typeof status, { icon: string; title: string; text: string; sub?: string }> = {
    loading: { icon: '⏳', title: 'Confirming…', text: 'Please wait while we verify your email.' },
    success: { icon: '✓', title: 'Email confirmed!', text: 'Your account is now active. You can log in.', sub: 'Welcome to Villainous.' },
    expired: { icon: '⌛', title: 'Link expired', text: 'This confirmation link has expired. Register again to get a new one.' },
    invalid: { icon: '✕', title: 'Invalid link', text: 'This confirmation link is not valid.' },
    error:   { icon: '!', title: 'Something went wrong', text: 'Could not confirm your email. Please try again later.' },
  };

  const { icon, title, text, sub } = content[status];

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={`${styles.icon} ${status === 'success' ? styles.iconSuccess : status === 'loading' ? styles.iconNeutral : styles.iconError}`}>
          {icon}
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{text}</p>
        {sub && <p className={styles.subtext}>{sub}</p>}
        {status !== 'loading' && (
          <button className={styles.button} onClick={() => navigate('/')}>
            {status === 'success' ? 'Go to login' : 'Back to login'}
          </button>
        )}
      </div>
    </main>
  );
}
