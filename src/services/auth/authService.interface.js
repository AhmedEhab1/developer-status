/**
 * Auth Service Contract
 *
 * Any implementation must export an object named `authService` with these methods:
 *
 * @typedef {Object} AppUser
 * @property {string} uid
 * @property {string} email
 * @property {string} displayName
 * @property {'developer'|'team_lead'} role
 *
 * @typedef {Object} AuthService
 * @property {(email: string, password: string) => Promise<AppUser>} login
 * @property {(email: string, password: string, displayName: string, role: string) => Promise<AppUser>} register
 * @property {() => Promise<void>} logout
 * @property {(callback: (user: AppUser|null) => void) => () => void} onAuthStateChanged
 *
 * To replace Firebase:
 * 1. Create a new file (e.g., apiAuthService.js) implementing the AuthService shape
 * 2. Update index.js to re-export from the new file
 */
