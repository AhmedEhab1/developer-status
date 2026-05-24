import { useState } from 'react';
import StatusBadge from '../../common/StatusBadge/StatusBadge';
import ConfirmDialog from '../../common/ConfirmDialog/ConfirmDialog';
import { TICKET_STATUS, STATUS_LABELS } from '../../../utils/constants';
import styles from './TicketCard.module.css';

export default function TicketCard({
  ticket,
  projectName,
  projects,
  canDelete,
  canEdit,
  isTeamLead,
  onDelete,
  onEdit,
  onPendingUpdate,
}) {
  const hasPending = ticket.pendingApproval || ticket.pendingChanges;
  const projectMap = projects
    ? Object.fromEntries(projects.map((p) => [p.id, p.name]))
    : {};

  const [showConfirm, setShowConfirm] = useState(false);

  // Inline editing state for pending "New" column
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [editingStatus, setEditingStatus] = useState(false);

  // Pending display values
  const pendingTaskName = ticket.pendingChanges?.taskName;
  const pendingStatus = ticket.pendingChanges?.status;
  const pendingNotes = ticket.pendingChanges?.notes;
  const pendingProjectId = ticket.pendingChanges?.projectId;

  function startEditNotes() {
    setNotesValue(
      ticket.pendingChanges
        ? (pendingNotes ?? ticket.notes ?? '')
        : (ticket.notes || '')
    );
    setEditingNotes(true);
  }

  function saveNotes() {
    if (onPendingUpdate) {
      if (ticket.pendingApproval && !ticket.pendingChanges) {
        // New ticket — update main fields directly
        onPendingUpdate(ticket, { notes: notesValue });
      } else {
        const current = ticket.pendingChanges || {};
        onPendingUpdate(ticket, { ...current, notes: notesValue });
      }
    }
    setEditingNotes(false);
  }

  function handleStatusChange(newStatus) {
    if (onPendingUpdate) {
      if (ticket.pendingApproval && !ticket.pendingChanges) {
        // New ticket — update main fields directly
        onPendingUpdate(ticket, { status: newStatus });
      } else {
        const current = ticket.pendingChanges || {};
        onPendingUpdate(ticket, { ...current, status: newStatus });
      }
    }
    setEditingStatus(false);
  }

  function handleNotesKeyDown(e) {
    if (e.key === 'Escape') setEditingNotes(false);
  }

  return (
    <div className={`${styles.card} ${hasPending ? styles.pendingCard : ''}`}>
      <div className={styles.topRow}>
        {ticket.pendingApproval && (
          <span className={styles.pendingBadge}>Pending Approval</span>
        )}
        {ticket.pendingChanges && (
          <span className={styles.pendingBadge}>Pending Changes</span>
        )}
        <div className={styles.topActions}>
          {/* Edit button for non-pending tickets */}
          {!hasPending && canEdit && (
            <button
              className={styles.editBtn}
              onClick={() => onEdit(ticket)}
              title="Edit ticket"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              className={styles.removeBtn}
              onClick={() => setShowConfirm(true)}
              title="Remove ticket"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Brand-new pending ticket — single view with inline editing */}
      {ticket.pendingApproval && !ticket.pendingChanges && (
        <div>
          <div className={styles.fieldRow}>
            <span className={styles.taskName}>{ticket.taskName}</span>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.project}>{projectName}</span>
          </div>
          {/* Inline status edit */}
          <div className={styles.fieldRow}>
            {isTeamLead && editingStatus ? (
              <select
                className={styles.statusDropdown}
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                onBlur={() => setEditingStatus(false)}
                autoFocus
              >
                {Object.entries(TICKET_STATUS).map(([key, value]) => (
                  <option key={key} value={value}>
                    {STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
            ) : (
              <span
                className={isTeamLead ? styles.clickable : undefined}
                onClick={isTeamLead ? () => setEditingStatus(true) : undefined}
              >
                <StatusBadge status={ticket.status} />
              </span>
            )}
          </div>
          {/* Inline notes edit */}
          {isTeamLead && editingNotes ? (
            <div className={styles.inlineField}>
              <textarea
                className={styles.inlineInput}
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                onKeyDown={handleNotesKeyDown}
                rows={2}
                autoFocus
              />
              <div className={styles.inlineActions}>
                <button className={styles.inlineSave} onClick={saveNotes}>Save</button>
                <button className={styles.inlineCancel} onClick={() => setEditingNotes(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <p
              className={`${styles.notes} ${isTeamLead ? styles.clickable : ''}`}
              onClick={isTeamLead ? startEditNotes : undefined}
            >
              {ticket.notes || (isTeamLead ? 'Click to add notes...' : '')}
            </p>
          )}
        </div>
      )}

      {/* Existing ticket with pending changes — two-column Current | New */}
      {ticket.pendingChanges && (
        <div className={styles.columns}>
          <div className={`${styles.col} ${styles.currentCol}`}>
            <span className={styles.colLabel}>Current</span>
            <div className={styles.fieldRow}>
              <span className={styles.taskName}>{ticket.taskName}</span>
            </div>
            <div className={styles.fieldRow}>
              <span className={styles.project}>{projectName}</span>
            </div>
            <div className={styles.fieldRow}>
              <StatusBadge status={ticket.status} />
            </div>
            {ticket.notes && (
              <p className={styles.notes}>{ticket.notes}</p>
            )}
          </div>

          <div className={`${styles.col} ${styles.newCol}`}>
            <span className={styles.colLabel}>New</span>
            <div className={styles.fieldRow}>
              <span className={styles.taskName}>
                {pendingTaskName ?? ticket.taskName}
              </span>
            </div>
            <div className={styles.fieldRow}>
              <span className={styles.project}>
                {pendingProjectId
                  ? projectMap[pendingProjectId] || 'Unknown Project'
                  : projectName}
              </span>
            </div>
            {/* Inline status edit */}
            <div className={styles.fieldRow}>
              {isTeamLead && editingStatus ? (
                <select
                  className={styles.statusDropdown}
                  value={pendingStatus ?? ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  onBlur={() => setEditingStatus(false)}
                  autoFocus
                >
                  {Object.entries(TICKET_STATUS).map(([key, value]) => (
                    <option key={key} value={value}>
                      {STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className={isTeamLead ? styles.clickable : undefined}
                  onClick={isTeamLead ? () => setEditingStatus(true) : undefined}
                >
                  <StatusBadge status={pendingStatus ?? ticket.status} />
                </span>
              )}
            </div>
            {/* Inline notes edit */}
            {isTeamLead && editingNotes ? (
              <div className={styles.inlineField}>
                <textarea
                  className={styles.inlineInput}
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  onKeyDown={handleNotesKeyDown}
                  rows={2}
                  autoFocus
                />
                <div className={styles.inlineActions}>
                  <button className={styles.inlineSave} onClick={saveNotes}>Save</button>
                  <button className={styles.inlineCancel} onClick={() => setEditingNotes(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <p
                className={`${styles.notes} ${isTeamLead ? styles.clickable : ''}`}
                onClick={isTeamLead ? startEditNotes : undefined}
              >
                {(pendingNotes ?? ticket.notes) || (isTeamLead ? 'Click to add notes...' : '')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Normal ticket — no pending state */}
      {!ticket.pendingApproval && !ticket.pendingChanges && (
        <div>
          <div className={styles.fieldRow}>
            <span className={styles.taskName}>{ticket.taskName}</span>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.project}>{projectName}</span>
          </div>
          <div className={styles.fieldRow}>
            <StatusBadge status={ticket.status} />
          </div>
          {ticket.notes && (
            <p className={styles.notes}>{ticket.notes}</p>
          )}
        </div>
      )}

      {showConfirm && (
        <ConfirmDialog
          title="Remove Ticket"
          message={`Are you sure you want to remove "${ticket.taskName}"? This cannot be undone.`}
          confirmLabel="Remove"
          danger
          onConfirm={() => {
            setShowConfirm(false);
            onDelete(ticket);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
