import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './SignUpPage.module.scss';

export function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== repeatPassword) {
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data);

        return;
      }

      console.log('User created:', data);

      navigate('/signup-confirmation');
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <main className={styles.page}>
      <video className={styles.backgroundVideo} autoPlay loop muted playsInline>
        <source src="/login.mp4" type="video/mp4" />
      </video>

      <div className={styles.overlay} />

      <section className={styles.signupCard}>
        <h1>Create your account</h1>

        <p>Create an account to start your adventure.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="repeatPassword">Repeat password</label>

            <input
              id="repeatPassword"
              type="password"
              value={repeatPassword}
              onChange={(event) => setRepeatPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          {password && repeatPassword && password !== repeatPassword && (
            <p className={styles.error}>Passwords do not match.</p>
          )}

          <button
            type="submit"
            className={styles.signupButton}
            disabled={
              !email ||
              !password ||
              !repeatPassword ||
              password !== repeatPassword
            }
          >
            Create account
          </button>
        </form>

        <div className={styles.loginLink}>
          <span>Already have an account?</span>

          <Link to="/">Log in</Link>
        </div>
      </section>
    </main>
  );
}
