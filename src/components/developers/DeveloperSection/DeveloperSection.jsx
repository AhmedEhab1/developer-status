import { useState, useMemo } from 'react';
import TicketList from '../../tickets/TicketList/TicketList';
import ConfirmDialog from '../../common/ConfirmDialog/ConfirmDialog';
import TicketHistoryModal from '../../tickets/TicketHistoryModal/TicketHistoryModal';
import { ROLE_LABELS, PLATFORM_LABELS, DEV_LEVEL_LABELS } from '../../../utils/constants';
import styles from './DeveloperSection.module.css';

function formatDate(timestamp) {
  if (!timestamp) return null;
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DeveloperSection({
  user,
  tickets,
  historyTickets,
  projects,
  canDelete,
  canEdit,
  isTeamLead,
  onDeleteTicket,
  onEditTicket,
  onPendingUpdate,
  onApproveAll,
}) {
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const lastUpdate = useMemo(() => {
    if (tickets.length === 0) return null;
    let latest = null;
    for (const t of tickets) {
      const ts = t.updatedAt || t.createdAt;
      if (!ts) continue;
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      if (!latest || date > latest) latest = date;
    }
    return latest;
  }, [tickets]);

  const pendingTickets = tickets.filter(
    (t) => t.pendingApproval || t.pendingChanges
  );
  const hasPending = pendingTickets.length > 0;

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div className={styles.nameRow}>
          <h3 className={styles.name}>{user.displayName}</h3>
          <span className={styles.role}>{ROLE_LABELS[user.role]}</span>
          {user.platform && (
            <span className={styles.platform}>{PLATFORM_LABELS[user.platform] || user.platform}</span>
          )}
          {user.level && (
            <span className={styles.level}>{DEV_LEVEL_LABELS[user.level] || user.level}</span>
          )}
          {lastUpdate && (
            <span className={styles.lastUpdate}>
              Last update: {formatDate(lastUpdate)}
            </span>
          )}
        </div>
        <div className={styles.headerActions}>
          <button className={styles.historyBtn} onClick={() => setShowHistory(true)}>
            History{historyTickets.length > 0 ? ` (${historyTickets.length})` : ''}
          </button>
          <span className={styles.count}>{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</span>
          {isTeamLead && hasPending && (
            <button className={styles.approveBtn} onClick={() => setShowApproveConfirm(true)}>
              Approve ({pendingTickets.length})
            </button>
          )}
        </div>
      </div>
      <TicketList
        tickets={tickets}
        projects={projects}
        canDelete={canDelete}
        canEdit={canEdit}
        isTeamLead={isTeamLead}
        onDelete={onDeleteTicket}
        onEdit={onEditTicket}
        onPendingUpdate={onPendingUpdate}
      />

      {showApproveConfirm && (
        <ConfirmDialog
          title="Approve Changes"
          message={`Approve all ${pendingTickets.length} pending change(s) for ${user.displayName}?`}
          confirmLabel="Approve All"
          onConfirm={() => {
            setShowApproveConfirm(false);
            onApproveAll(pendingTickets);
          }}
          onCancel={() => setShowApproveConfirm(false)}
        />
      )}

      {showHistory && (
        <TicketHistoryModal
          user={user}
          tickets={historyTickets}
          projects={projects}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
