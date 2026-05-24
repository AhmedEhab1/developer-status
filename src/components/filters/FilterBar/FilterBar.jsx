import { PLATFORMS, PLATFORM_LABELS } from '../../../utils/constants';
import styles from './FilterBar.module.css';

export default function FilterBar({
  users,
  projects,
  selectedUserId,
  selectedProjectId,
  onUserChange,
  onProjectChange,
  dateOptions,
  selectedDate,
  onDateChange,
  selectedPlatform,
  onPlatformChange,
}) {
  return (
    <div className={styles.bar}>
      <div className={styles.filter}>
        <label htmlFor="filterUser">Developer</label>
        <select
          id="filterUser"
          value={selectedUserId}
          onChange={(e) => onUserChange(e.target.value)}
        >
          <option value="">All Developers</option>
          {users.map((u) => (
            <option key={u.uid} value={u.uid}>
              {u.displayName}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filter}>
        <label htmlFor="filterProject">Project</label>
        <select
          id="filterProject"
          value={selectedProjectId}
          onChange={(e) => onProjectChange(e.target.value)}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filter}>
        <label htmlFor="filterPlatform">Platform</label>
        <select
          id="filterPlatform"
          value={selectedPlatform}
          onChange={(e) => onPlatformChange(e.target.value)}
        >
          <option value="">All Platforms</option>
          {Object.entries(PLATFORMS).map(([key, value]) => (
            <option key={key} value={value}>
              {PLATFORM_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {dateOptions && dateOptions.length > 0 && (
        <div className={styles.filter}>
          <label htmlFor="filterDate">Update Day</label>
          <select
            id="filterDate"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
          >
            <option value="">All Dates</option>
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
