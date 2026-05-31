import TicketCard from '../TicketCard/TicketCard';
import styles from './TicketList.module.css';

export default function TicketList({
  tickets,
  projects,
  canDelete,
  canEdit,
  isTeamLead,
  onDelete,
  onEdit,
  onPendingUpdate,
}) {
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  if (tickets.length === 0) {
    return <p className={styles.empty}>No tickets yet</p>;
  }

  // Group tickets by projectId, preserving first-seen order
  const groups = [];
  const seen = {};
  for (const ticket of tickets) {
    const pid = ticket.projectId || '__unknown__';
    if (!seen[pid]) {
      seen[pid] = [];
      groups.push({ projectId: pid, tickets: seen[pid] });
    }
    seen[pid].push(ticket);
  }

  return (
    <div className={styles.groups}>
      {groups.map(({ projectId, tickets: group }) => (
        <div key={projectId} className={styles.group}>
          <span className={styles.projectLabel}>
            {projectMap[projectId] || 'Unknown Project'}
          </span>
          <div className={styles.grid}>
            {group.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                projectName={projectMap[ticket.projectId] || 'Unknown Project'}
                projects={projects}
                canDelete={canDelete}
                canEdit={canEdit}
                isTeamLead={isTeamLead}
                onDelete={onDelete}
                onEdit={onEdit}
                onPendingUpdate={onPendingUpdate}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
