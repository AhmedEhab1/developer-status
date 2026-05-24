import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services/auth';
import { USER_ROLES, ROLE_LABELS } from '../../../utils/constants';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await authService.logout();
    navigate('/login');
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <Link to="/" className={styles.brand}>
          DevStatus
        </Link>
        <Link to="/" className={styles.link}>
          Home
        </Link>
        {currentUser?.role === USER_ROLES.TEAM_LEAD && (
          <Link to="/projects" className={styles.link}>
            Manage Projects
          </Link>
        )}
      </div>

      <div className={styles.right}>
        <span className={styles.user}>
          {currentUser?.displayName}
          <span className={styles.role}>
            {ROLE_LABELS[currentUser?.role]}
          </span>
        </span>
        <button onClick={handleLogout} className={styles.logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
