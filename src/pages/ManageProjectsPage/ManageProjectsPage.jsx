import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../hooks/useProjects';
import { useUsers } from '../../hooks/useUsers';
import { useSettings } from '../../hooks/useSettings';
import { dataService } from '../../services/data';
import { authService } from '../../services/auth';
import { DAY_NAMES, USER_ROLES, ROLE_LABELS, PLATFORMS, PLATFORM_LABELS, DEV_LEVELS, DEV_LEVEL_LABELS } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import styles from './ManageProjectsPage.module.css';

const SECTIONS = [
  { id: 'register', label: 'Register User' },
  { id: 'update-days', label: 'Update Days' },
  { id: 'team', label: 'Team Members' },
  { id: 'projects', label: 'Projects' },
];

export default function ManageProjectsPage() {
  const { currentUser } = useAuth();
  const { projects, loading } = useProjects();
  const { users, loading: usersLoading } = useUsers();
  const { settings, loading: settingsLoading } = useSettings();
  const [activeSection, setActiveSection] = useState('register');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingDays, setSavingDays] = useState(false);

  // Register new user state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPlatform, setRegPlatform] = useState(PLATFORMS.ANDROID);
  const [regLevel, setRegLevel] = useState(DEV_LEVELS.SENIOR_I);
  const [regSaving, setRegSaving] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');

  async function handleToggleDay(dayNum) {
    const current = settings.updateDays || [0, 2];
    let updated;
    if (current.includes(dayNum)) {
      updated = current.filter((d) => d !== dayNum);
    } else {
      updated = [...current, dayNum].sort((a, b) => a - b);
    }
    setSavingDays(true);
    try {
      await dataService.updateSettings({ updateDays: updated });
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSavingDays(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) return;
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setRegSuccess('');
    setRegSaving(true);
    try {
      await authService.registerUser(regEmail.trim(), regPassword, regName.trim(), regPlatform, regLevel);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegPlatform(PLATFORMS.ANDROID);
      setRegLevel(DEV_LEVELS.SENIOR_I);
      setRegSuccess('User registered successfully!');
      setTimeout(() => setRegSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to register user');
    } finally {
      setRegSaving(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setError('');
    setSaving(true);
    try {
      await dataService.addProject(name.trim(), currentUser.uid);
      setName('');
    } catch (err) {
      setError(err.message || 'Failed to add project');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangeLevel(user, newLevel) {
    try {
      await dataService.updateUserLevel(user.uid, newLevel);
    } catch (err) {
      setError(err.message || 'Failed to update level');
    }
  }

  async function handleToggleActive(project) {
    const isActive = project.active !== false;
    try {
      await dataService.updateProject(project.id, { active: !isActive });
    } catch (err) {
      setError(err.message || 'Failed to update project');
    }
  }

  async function handleToggleRole(user) {
    const newRole =
      user.role === USER_ROLES.TEAM_LEAD
        ? USER_ROLES.DEVELOPER
        : USER_ROLES.TEAM_LEAD;
    try {
      await dataService.updateUserRole(user.uid, newRole);
    } catch (err) {
      setError(err.message || 'Failed to update role');
    }
  }

  async function handleDelete(id, projectName) {
    if (!window.confirm(`Delete project "${projectName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await dataService.deleteProject(id);
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    }
  }

  if (loading || usersLoading || settingsLoading) {
    return <LoadingSpinner />;
  }

  const updateDays = settings.updateDays || [0, 2];

  return (
    <div className={styles.page}>
      <nav className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Settings</h2>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`${styles.navItem} ${activeSection === s.id ? styles.navItemActive : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        <ErrorMessage message={error} />

        {/* Register New User */}
        {activeSection === 'register' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Register New User</h2>
            <p className={styles.sectionDesc}>
              Create a new account for a team member.
            </p>
            {regSuccess && <p className={styles.successMsg}>{regSuccess}</p>}
            <form onSubmit={handleRegister} className={styles.regForm}>
              <div className={styles.regField}>
                <label>Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className={styles.regField}>
                <label>Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>
              <div className={styles.regField}>
                <label>Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>
              <div className={styles.regField}>
                <label>Platform</label>
                <select value={regPlatform} onChange={(e) => setRegPlatform(e.target.value)}>
                  {Object.entries(PLATFORMS).map(([key, value]) => (
                    <option key={key} value={value}>{PLATFORM_LABELS[value]}</option>
                  ))}
                </select>
              </div>
              <div className={styles.regField}>
                <label>Level</label>
                <select value={regLevel} onChange={(e) => setRegLevel(e.target.value)}>
                  {Object.entries(DEV_LEVELS).map(([key, value]) => (
                    <option key={key} value={value}>{DEV_LEVEL_LABELS[value]}</option>
                  ))}
                </select>
              </div>
              <div className={styles.regSubmit}>
                <button type="submit" className={styles.addBtn} disabled={regSaving}>
                  {regSaving ? 'Registering...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Update Days */}
        {activeSection === 'update-days' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Update Days</h2>
            <p className={styles.sectionDesc}>
              Developers can only add or edit tickets on these days.
            </p>
            <div className={styles.dayGrid}>
              {Object.entries(DAY_NAMES).map(([num, name]) => {
                const dayNum = Number(num);
                const checked = updateDays.includes(dayNum);
                return (
                  <label key={dayNum} className={styles.dayLabel}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleDay(dayNum)}
                      disabled={savingDays}
                    />
                    <span>{name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Team Members */}
        {activeSection === 'team' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Team Members</h2>
            <p className={styles.sectionDesc}>
              Promote or demote team members.
            </p>
            <div className={styles.list}>
              {users.map((user) => {
                const isSelf = user.uid === currentUser.uid;
                const isLead = user.role === USER_ROLES.TEAM_LEAD;
                return (
                  <div key={user.uid} className={styles.item}>
                    <div className={styles.itemInfo}>
                      <span className={styles.projectName}>{user.displayName}</span>
                      <span className={isLead ? styles.leadBadge : styles.devBadge}>
                        {ROLE_LABELS[user.role]}
                      </span>
                      {user.platform && (
                        <span className={styles.platformBadge}>
                          {PLATFORM_LABELS[user.platform] || user.platform}
                        </span>
                      )}
                      {user.level && (
                        <span className={styles.levelBadge}>
                          {DEV_LEVEL_LABELS[user.level] || user.level}
                        </span>
                      )}
                    </div>
                    <div className={styles.itemActions}>
                      {!isLead && (
                        <select
                          className={styles.levelSelect}
                          value={user.level || DEV_LEVELS.SENIOR_I}
                          onChange={(e) => handleChangeLevel(user, e.target.value)}
                        >
                          {Object.entries(DEV_LEVELS).map(([key, value]) => (
                            <option key={key} value={value}>
                              {DEV_LEVEL_LABELS[value]}
                            </option>
                          ))}
                        </select>
                      )}
                      {!isSelf && (
                        <button
                          className={isLead ? styles.demoteBtn : styles.promoteBtn}
                          onClick={() => handleToggleRole(user)}
                        >
                          {isLead ? 'Demote to Developer' : 'Promote to Team Lead'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Projects */}
        {activeSection === 'projects' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Projects</h2>
            <p className={styles.sectionDesc}>
              Add, activate, or remove projects.
            </p>

            <form onSubmit={handleAdd} className={styles.form}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                className={styles.input}
              />
              <button type="submit" className={styles.addBtn} disabled={saving}>
                {saving ? 'Adding...' : 'Add Project'}
              </button>
            </form>

            <div className={styles.list}>
              {projects.length === 0 && (
                <p className={styles.empty}>No projects yet. Add your first project above.</p>
              )}
              {projects.map((project) => {
                const isActive = project.active !== false;
                return (
                  <div
                    key={project.id}
                    className={`${styles.item} ${!isActive ? styles.itemInactive : ''}`}
                  >
                    <div className={styles.itemInfo}>
                      <span className={styles.projectName}>{project.name}</span>
                      {!isActive && (
                        <span className={styles.inactiveBadge}>Inactive</span>
                      )}
                    </div>
                    <div className={styles.itemActions}>
                      <button
                        className={isActive ? styles.deactivateBtn : styles.activateBtn}
                        onClick={() => handleToggleActive(project)}
                      >
                        {isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(project.id, project.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
