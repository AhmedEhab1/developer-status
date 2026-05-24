import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers } from '../../hooks/useUsers';
import { useProjects } from '../../hooks/useProjects';
import { useTickets } from '../../hooks/useTickets';
import { useSettings } from '../../hooks/useSettings';
import { dataService } from '../../services/data';
import { USER_ROLES, DAY_NAMES } from '../../utils/constants';
import FilterBar from '../../components/filters/FilterBar/FilterBar';
import DeveloperSection from '../../components/developers/DeveloperSection/DeveloperSection';
import TicketForm from '../../components/tickets/TicketForm/TicketForm';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { currentUser } = useAuth();
  const { users, loading: usersLoading } = useUsers();
  const { projects, loading: projectsLoading } = useProjects();
  const { tickets, loading: ticketsLoading } = useTickets();
  const { settings, loading: settingsLoading } = useSettings();

  const [filterUserId, setFilterUserId] = useState('');
  const [filterProjectId, setFilterProjectId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  const isTeamLead = currentUser?.role === USER_ROLES.TEAM_LEAD;
  const todayDay = new Date().getDay();
  const isUpdateDay = isTeamLead || (settings.updateDays || []).includes(todayDay);

  const updateDayNames = (settings.updateDays || [])
    .sort((a, b) => a - b)
    .map((d) => DAY_NAMES[d])
    .join(', ');

  const dateOptions = useMemo(() => {
    const days = settings.updateDays || [];
    if (days.length === 0) return [];
    const options = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cursor = new Date(today);
    for (let i = 0; i <= 28 && options.length < 10; i++) {
      const d = new Date(cursor);
      d.setDate(cursor.getDate() - i);
      if (days.includes(d.getDay())) {
        const value = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        options.push({ value, label });
      }
    }
    return options;
  }, [settings.updateDays]);

  const filteredTickets = useMemo(() => {
    let result = tickets;
    if (filterUserId) {
      result = result.filter((t) => t.userId === filterUserId);
    }
    if (filterProjectId) {
      result = result.filter((t) => t.projectId === filterProjectId);
    }
    if (filterDate) {
      const dayStart = new Date(filterDate + 'T00:00:00');
      const dayEnd = new Date(filterDate + 'T23:59:59');
      result = result.filter((t) => {
        const ts = t.updatedAt || t.createdAt;
        if (!ts) return false;
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        return date >= dayStart && date <= dayEnd;
      });
    }
    return result;
  }, [tickets, filterUserId, filterProjectId, filterDate]);

  const displayUsers = useMemo(() => {
    let result = users;
    if (filterUserId) {
      result = result.filter((u) => u.uid === filterUserId);
    }
    if (filterPlatform) {
      result = result.filter((u) => u.platform === filterPlatform);
    }
    return result;
  }, [users, filterUserId, filterPlatform]);

  // Open edit dialog for a non-pending ticket
  function handleEdit(ticket) {
    setEditingTicket(ticket);
    setShowForm(true);
  }

  // Save from the TicketForm (new ticket or editing existing)
  async function handleSave(data) {
    if (editingTicket) {
      if (isTeamLead) {
        await dataService.updateTicket(editingTicket.id, data);
      } else {
        await dataService.submitTicketChanges(editingTicket.id, data);
      }
    } else {
      const newTicket = await dataService.addTicket({
        ...data,
        userId: currentUser.uid,
      });
      if (isTeamLead) {
        await dataService.approveTicket(newTicket.id, { pendingApproval: true });
      }
    }
  }

  // Inline update of pending changes (notes/status on the "New" column)
  async function handlePendingUpdate(ticket, changes) {
    if (ticket.pendingApproval) {
      // Whole ticket is pending — update main fields directly
      await dataService.updateTicket(ticket.id, changes);
    } else {
      // Existing ticket with pending changes — update pendingChanges
      await dataService.submitTicketChanges(ticket.id, changes);
    }
  }

  // Remove ticket (confirmation is in TicketCard)
  async function handleDelete(ticket) {
    await dataService.deleteTicket(ticket.id);
  }

  // Approve all pending tickets for a developer
  async function handleApproveAll(pendingTickets) {
    for (const ticket of pendingTickets) {
      await dataService.approveTicket(ticket.id, ticket);
    }
  }

  function handleClose() {
    setShowForm(false);
    setEditingTicket(null);
  }

  if (usersLoading || projectsLoading || ticketsLoading || settingsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        {isUpdateDay && (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            + Add Ticket
          </button>
        )}
      </div>

      {!isUpdateDay && (
        <div className={styles.infoBanner}>
          Updates are available on: {updateDayNames || 'No days configured'}
        </div>
      )}

      <FilterBar
        users={users}
        projects={projects}
        selectedUserId={filterUserId}
        selectedProjectId={filterProjectId}
        onUserChange={setFilterUserId}
        onProjectChange={setFilterProjectId}
        dateOptions={dateOptions}
        selectedDate={filterDate}
        onDateChange={setFilterDate}
        selectedPlatform={filterPlatform}
        onPlatformChange={setFilterPlatform}
      />

      <div className={styles.sections}>
        {displayUsers.map((user) => {
          const userTickets = filteredTickets.filter(
            (t) => t.userId === user.uid
          );
          const isOwner = currentUser?.uid === user.uid;
          const canDelete = isTeamLead || isOwner;
          const canEdit = isUpdateDay && (isTeamLead || isOwner);

          return (
            <DeveloperSection
              key={user.uid}
              user={user}
              tickets={userTickets}
              projects={projects}
              canDelete={canDelete}
              canEdit={canEdit}
              isTeamLead={isTeamLead}
              onDeleteTicket={handleDelete}
              onEditTicket={handleEdit}
              onPendingUpdate={handlePendingUpdate}
              onApproveAll={handleApproveAll}
            />
          );
        })}

        {displayUsers.length === 0 && (
          <p className={styles.empty}>No developers found</p>
        )}
      </div>

      {showForm && (
        <TicketForm
          ticket={editingTicket}
          projects={projects}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
