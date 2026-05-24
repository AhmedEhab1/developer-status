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

  return (
    <div className={styles.grid}>
      {tickets.map((ticket) => (
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
  );
}
