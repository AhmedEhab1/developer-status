import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

export const dataService = {
  // ---- Projects ----

  async addProject(name, createdBy) {
    const docRef = await addDoc(collection(db, 'projects'), {
      name,
      createdBy,
      active: false,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, name, createdBy, active: true };
  },

  async updateProject(id, updates) {
    await updateDoc(doc(db, 'projects', id), updates);
  },

  async deleteProject(id) {
    await deleteDoc(doc(db, 'projects', id));
  },

  subscribeProjects(callback) {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(projects);
    }, (err) => {
      console.error('subscribeProjects error:', err);
      callback([]);
    });
  },

  // ---- Tickets ----

  async addTicket({ userId, projectId, taskName, status, notes }) {
    const docRef = await addDoc(collection(db, 'tickets'), {
      userId,
      projectId,
      taskName,
      status,
      notes: notes || '',
      pendingApproval: true,
      pendingChanges: null,
      pendingAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, userId, projectId, taskName, status, notes };
  },

  async updateTicket(id, updates) {
    const { id: _id, createdAt, ...safeUpdates } = updates;
    const extra = {};
    if ('status' in safeUpdates) {
      extra.completedAt = safeUpdates.status === 'completed' ? serverTimestamp() : null;
    }
    await updateDoc(doc(db, 'tickets', id), {
      ...safeUpdates,
      ...extra,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteTicket(id) {
    await deleteDoc(doc(db, 'tickets', id));
  },

  subscribeTickets(callback) {
    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const tickets = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(tickets);
    }, (err) => {
      console.error('subscribeTickets error:', err);
      callback([]);
    });
  },

  // ---- Users ----

  subscribeUsers(callback) {
    const q = query(collection(db, 'users'));
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(users);
    }, (err) => {
      console.error('subscribeUsers error:', err);
      callback([]);
    });
  },

  async updateUserRole(uid, role) {
    await updateDoc(doc(db, 'users', uid), { role });
  },

  async updateUserLevel(uid, level) {
    await updateDoc(doc(db, 'users', uid), { level });
  },

  // ---- Settings ----

  async getSettings() {
    const snap = await getDoc(doc(db, 'settings', 'general'));
    if (snap.exists()) return snap.data();
    return { updateDays: [0, 2] };
  },

  async updateSettings(settings) {
    await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
  },

  subscribeSettings(callback) {
    return onSnapshot(doc(db, 'settings', 'general'), (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      } else {
        callback({ updateDays: [0, 2] });
      }
    }, (err) => {
      console.error('subscribeSettings error:', err);
      callback({ updateDays: [0, 2] });
    });
  },

  // ---- Ticket Approval ----

  async submitTicketChanges(id, changes) {
    await updateDoc(doc(db, 'tickets', id), {
      pendingChanges: changes,
      pendingAt: serverTimestamp(),
    });
  },

  async approveTicket(id, ticket) {
    if (ticket.pendingApproval) {
      const completedAt = ticket.status === 'completed' ? serverTimestamp() : null;
      await updateDoc(doc(db, 'tickets', id), {
        pendingApproval: false,
        pendingAt: null,
        completedAt,
        updatedAt: serverTimestamp(),
      });
    } else if (ticket.pendingChanges) {
      const newStatus = ticket.pendingChanges.status ?? ticket.status;
      const completedAt = newStatus === 'completed' ? serverTimestamp() : null;
      await updateDoc(doc(db, 'tickets', id), {
        ...ticket.pendingChanges,
        pendingChanges: null,
        pendingAt: null,
        completedAt,
        updatedAt: serverTimestamp(),
      });
    }
  },

  async rejectTicket(id, ticket) {
    if (ticket.pendingApproval) {
      await deleteDoc(doc(db, 'tickets', id));
    } else if (ticket.pendingChanges) {
      await updateDoc(doc(db, 'tickets', id), {
        pendingChanges: null,
        pendingAt: null,
      });
    }
  },
};
