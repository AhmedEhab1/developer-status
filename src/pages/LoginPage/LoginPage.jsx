import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(email, password);
    } catch (err) {
      const code = err.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Incorrect email or password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.');
      } else {
        setError(err.message || err.code || 'Failed to log in');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      await authService.sendPasswordResetEmail(resetEmail);
      setResetSent(true);
    } catch (err) {
      const code = err.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-email') {
        setResetError('No account found with that email.');
      } else {
        setResetError(err.message || 'Failed to send reset email.');
      }
    } finally {
      setResetLoading(false);
    }
  }

  function openForgot() {
    setResetEmail(email);
    setResetSent(false);
    setResetError('');
    setForgotMode(true);
  }

  function backToLogin() {
    setForgotMode(false);
    setResetSent(false);
    setResetError('');
  }

  if (forgotMode) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>
            {resetSent
              ? 'Check your inbox for a reset link.'
              : "Enter your email and we'll send you a reset link."}
          </p>

          {!resetSent && (
            <>
              <ErrorMessage message={resetError} />
              <form onSubmit={handleResetSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label htmlFor="resetEmail">Email</label>
                  <input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    autoFocus
                  />
                </div>
                <button type="submit" className={styles.button} disabled={resetLoading}>
                  {resetLoading ? 'Sending...' : 'Send Reset Email'}
                </button>
              </form>
            </>
          )}

          <p className={styles.footer}>
            <button className={styles.linkBtn} onClick={backToLogin}>
              Back to Sign In
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Developer Status</h1>
        <p className={styles.subtitle}>Sign in to your account</p>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
            />
          </div>

          <div className={styles.field}>
            <div className={styles.passwordLabel}>
              <label htmlFor="password">Password</label>
              <button type="button" className={styles.linkBtn} onClick={openForgot}>
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.footer}>
          Contact your team lead to get an account.
        </p>
      </div>
    </div>
  );
}
