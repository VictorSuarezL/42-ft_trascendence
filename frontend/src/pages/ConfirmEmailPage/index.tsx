import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');

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

  if (status === 'loading') {
    return <p>Confirming your email...</p>;
  }

  if (status === 'success') {
    return <p>Email confirmed successfully!</p>;
  }

  if (status === 'expired') {
    return <p>This confirmation link has expired.</p>;
  }

  if (status === 'invalid') {
    return <p>This confirmation link is invalid.</p>;
  }

  return <p>Something went wrong.</p>;
}
