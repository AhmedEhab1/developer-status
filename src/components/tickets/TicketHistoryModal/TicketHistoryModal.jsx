import { useState } from 'react';
import StatusBadge from '../../common/StatusBadge/StatusBadge';
import styles from './TicketHistoryModal.module.css';

function formatDate(ts) {
  if (!ts) return null;
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function TicketHistoryModal({ user, tickets, projects, onClose }) {
  const [search, setSearch] = useState('');

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  const filtered = search.trim()
    ? tickets.filter((t) =>
        t.taskName?.toLowerCase().includes(search.trim().toLowerCase())
      )
    : tickets;

  const groups = [];
  const seen = {};
  for (const ticket of filtered) {
    const pid = ticket.projectId || '__unknown__';
    if (!seen[pid]) {
      seen[pid] = [];
      groups.push({ projectId: pid, tickets: seen[pid] });
    }
    seen[pid].push(ticket);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Ticket History</h2>
            <p className={styles.subtitle}>{user.displayName}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.searchRow}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by ticket title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')}>&times;</button>
          )}
        </div>

        <div className={styles.content}>
          {tickets.length === 0 ? (
            <p className={styles.empty}>No completed tickets yet.</p>
          ) : filtered.length === 0 ? (
            <p className={styles.empty}>No tickets match "{search}".</p>
          ) : (
            groups.map(({ projectId, tickets: group }) => (
              <div key={projectId} className={styles.group}>
                <span className={styles.projectLabel}>
                  {projectMap[projectId] || 'Unknown Project'}
                </span>
                {group.map((ticket) => (
                  <div key={ticket.id} className={styles.ticketItem}>
                    <div className={styles.ticketTop}>
                      <span className={styles.taskName}>{ticket.taskName}</span>
                      <StatusBadge status={ticket.status} />
                    </div>
                    {ticket.notes && (
                      <p className={styles.notes}>{ticket.notes}</p>
                    )}
                    {ticket.createdAt && (
                      <p className={styles.date}>Created: {formatDate(ticket.createdAt)}</p>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
