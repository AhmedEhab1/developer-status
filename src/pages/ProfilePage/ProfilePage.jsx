import { useState } from 'react';
import { authService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS, PLATFORM_LABELS, DEV_LEVEL_LABELS } from '../../utils/constants';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { currentUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const code = err.code || '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Current password is incorrect.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.');
      } else if (code === 'auth/weak-password') {
        setError('New password is too weak.');
      } else {
        setError(err.message || 'Failed to update password.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Profile Settings</h1>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Account Info</h2>
        <div className={styles.infoGrid}>
          <span className={styles.infoLabel}>Name</span>
          <span className={styles.infoValue}>{currentUser?.displayName || currentUser?.email}</span>

          <span className={styles.infoLabel}>Email</span>
          <span className={styles.infoValue}>{currentUser?.email}</span>

          <span className={styles.infoLabel}>Role</span>
          <span className={styles.infoValue}>{ROLE_LABELS[currentUser?.role] || currentUser?.role}</span>

          {currentUser?.platform && (
            <>
              <span className={styles.infoLabel}>Platform</span>
              <span className={styles.infoValue}>
                {PLATFORM_LABELS[currentUser.platform] || currentUser.platform}
              </span>
            </>
          )}

          {currentUser?.level && (
            <>
              <span className={styles.infoLabel}>Level</span>
              <span className={styles.infoValue}>
                {DEV_LEVEL_LABELS[currentUser.level] || currentUser.level}
              </span>
            </>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Change Password</h2>

        {success && <p className={styles.successMsg}>{success}</p>}
        <ErrorMessage message={error} />

        <form onSubmit={handleChangePassword} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
