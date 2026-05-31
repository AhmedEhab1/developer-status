import { useState, useEffect } from 'react';
import { TICKET_STATUS, STATUS_LABELS } from '../../../utils/constants';
import ErrorMessage from '../../common/ErrorMessage/ErrorMessage';
import styles from './TicketForm.module.css';

export default function TicketForm({
  ticket,
  projects,
  users,
  isTeamLead,
  onSave,
  onClose,
}) {
  const isEditing = !!ticket;
  const availableProjects = projects.filter(
    (p) => p.active !== false || (isEditing && p.id === ticket?.projectId)
  );
  const developers = users || [];

  const [taskName, setTaskName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState(TICKET_STATUS.WILL_START);
  const [notes, setNotes] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ticket) {
      setTaskName(ticket.taskName || '');
      setProjectId(ticket.projectId || '');
      setStatus(ticket.status || TICKET_STATUS.WILL_START);
      setNotes(ticket.notes || '');
    }
  }, [ticket]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!taskName.trim()) {
      setError('Task name is required');
      return;
    }
    if (!projectId) {
      setError('Please select a project');
      return;
    }
    if (isTeamLead && !isEditing && !assignedUserId) {
      setError('Please select a developer to assign this ticket to');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        taskName: taskName.trim(),
        projectId,
        status,
        notes: notes.trim(),
        ...(isTeamLead && !isEditing ? { assignedUserId } : {}),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save ticket');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{isEditing ? 'Edit Ticket' : 'New Ticket'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className={styles.form}>
          {isTeamLead && !isEditing && (
            <div className={styles.field}>
              <label htmlFor="assignedUser">Assign To</label>
              <select
                id="assignedUser"
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                required
              >
                <option value="">Select a developer</option>
                {developers.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.displayName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="taskName">Task Name</label>
            <input
              id="taskName"
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="project">Project</label>
            <select
              id="project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              <option value="">Select a project</option>
              {availableProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {Object.entries(TICKET_STATUS).map(([key, value]) => (
                <option key={key} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={3}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
