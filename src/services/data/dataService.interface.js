/**
 * Data Service Contract
 *
 * Any implementation must export an object named `dataService` with these methods:
 *
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} createdBy - uid of creator
 * @property {Date} createdAt
 *
 * @typedef {Object} Ticket
 * @property {string} id
 * @property {string} userId
 * @property {string} projectId
 * @property {string} taskName
 * @property {'will_start'|'in_progress'|'completed'|'blocked'} status
 * @property {string} notes
 * @property {Date} createdAt
 * @property {Date} updatedAt
 *
 * @typedef {Object} DataService
 *
 * Projects:
 * @property {() => Promise<Project[]>} getProjects
 * @property {(name: string, createdBy: string) => Promise<Project>} addProject
 * @property {(id: string) => Promise<void>} deleteProject
 * @property {(callback: (projects: Project[]) => void) => () => void} subscribeProjects
 *
 * Tickets:
 * @property {(filters?: {userId?: string, projectId?: string}) => Promise<Ticket[]>} getTickets
 * @property {(ticket: Omit<Ticket, 'id'|'createdAt'|'updatedAt'>) => Promise<Ticket>} addTicket
 * @property {(id: string, updates: Partial<Ticket>) => Promise<void>} updateTicket
 * @property {(id: string) => Promise<void>} deleteTicket
 * @property {(callback: (tickets: Ticket[]) => void) => () => void} subscribeTickets
 *
 * Users:
 * @property {(callback: (users: AppUser[]) => void) => () => void} subscribeUsers
 *
 * To replace Firebase:
 * 1. Create a new file (e.g., apiDataService.js) implementing the DataService shape
 * 2. Update index.js to re-export from the new file
 */
