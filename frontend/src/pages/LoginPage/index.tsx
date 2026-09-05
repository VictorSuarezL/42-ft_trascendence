import { useNavigate } from 'react-router-dom';
import { useState, type SubmitEvent } from 'react';
import { useUser } from '../../contexts/UserContext';
import styles from './LoginPage.module.scss';
import backgroundImage from '../../assets/background-login.webp';

type AuthMode = 'login' | 'signup';

export function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const { setUser } = useUser();

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        return;
      }

      console.log('Login successful:', data);

      setUser(data.user);
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleSignup = async (event: SubmitEvent<HTMLFormElement>) => {
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

      // Por ahora volvemos al login.
      // Después podemos sustituir esto por un estado
      // de "Check your email".
      setMode('login');

      setPassword('');
      setRepeatPassword('');
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  const handleResetPassword = () => {
    navigate('/forgot-password');
  };

  const handleSwitchToSignup = () => {
    setMode('signup');

    setPassword('');
    setRepeatPassword('');
  };

  const handleSwitchToLogin = () => {
    setMode('login');

    setPassword('');
    setRepeatPassword('');
  };

  return (
    <main className={styles.page}>
      <img
        className={styles.backgroundVideo}
        src={backgroundImage}
        alt="Background"
      />

      <div className={styles.backgroundOverlay} />

      <div className={styles.villainGlow} />

      <section className={styles.content}>
        {/* Branding */}
        <div className={styles.brand}>
          <span className={styles.eyebrow}>ENTER THE KINGDOM</span>

          <h1 className={styles.logo}>Villainous</h1>

          <div className={styles.logoDivider}>
            <span />
            ✦
            <span />
          </div>

          <p className={styles.tagline}>It's good to be bad.</p>

          <p className={styles.description}>
            Choose your villain. Shape your destiny.
            <br />
            The story is yours to control.
          </p>
        </div>

        {/* Auth card */}
        <section className={styles.loginCard}>
          {mode === 'login' ? (
            <>
              <div className={styles.cardHeader}>
                <span className={styles.cardEyebrow}>WELCOME BACK</span>

                <h2>Enter your realm</h2>

                <p>Log in to continue your villainous journey.</p>
              </div>

              <form
                className={styles.form}
                onSubmit={(event) => {
                  event.preventDefault();
                  handleLogin();
                }}
              >
                <div className={styles.field}>
                  <label htmlFor="email">Email</label>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className={styles.field}>
                  <div className={styles.passwordLabel}>
                    <label htmlFor="password">Password</label>

                    <button type="button" onClick={handleResetPassword}>
                      Forgot password?
                    </button>
                  </div>

                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <button type="submit" className={styles.loginButton}>
                  Enter the Realm
                </button>
              </form>

              <div className={styles.divider}>
                <span />
                <span>or</span>
                <span />
              </div>

              <a href="/api/auth/42" className={styles.fortyTwoButton}>
                Continue with 42
              </a>

              <div className={styles.signupPrompt}>
                <span>New to the realm?</span>

                <button type="button" onClick={handleSwitchToSignup}>
                  Create an account
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.cardHeader}>
                <span className={styles.cardEyebrow}>JOIN THE REALM</span>

                <h2>Create your account</h2>

                <p>Every villain needs a beginning.</p>
              </div>

              <form className={styles.form} onSubmit={handleSignup}>
                <div className={styles.field}>
                  <label htmlFor="signup-email">Email</label>

                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="signup-password">Password</label>

                  <input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="signup-repeat-password">
                    Repeat password
                  </label>

                  <input
                    id="signup-repeat-password"
                    type="password"
                    placeholder="••••••••"
                    value={repeatPassword}
                    onChange={(event) => setRepeatPassword(event.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                {password && repeatPassword && password !== repeatPassword && (
                  <p className={styles.error}>Passwords do not match.</p>
                )}

                <button
                  type="submit"
                  className={styles.loginButton}
                  disabled={
                    !email ||
                    !password ||
                    !repeatPassword ||
                    password !== repeatPassword
                  }
                >
                  Create Account
                </button>
              </form>

              <div className={styles.signupPrompt}>
                <span>Already have an account?</span>

                <button type="button" onClick={handleSwitchToLogin}>
                  Log in
                </button>
              </div>
            </>
          )}
        </section>
      </section>

      <div className={styles.bottomDecoration}>
        <span>✦</span>
        <span>✦</span>
        <span>✦</span>
      </div>
    </main>
  );
}
