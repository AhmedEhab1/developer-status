import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  reauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, secondaryAuth, db } from '../../config/firebase';

async function fetchUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

export const authService = {
  async login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return fetchUserProfile(cred.user.uid);
  },

  async registerUser(email, password, displayName, platform, level) {
    // Use secondary auth so the current team lead session is not affected
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await signOut(secondaryAuth);
    const profile = {
      uid: cred.user.uid,
      email,
      displayName,
      role: 'developer',
      platform: platform || null,
      level: level || 'senior_i',
    };
    await setDoc(doc(db, 'users', cred.user.uid), profile);
    return profile;
  },

  async logout() {
    await signOut(auth);
  },

  async sendPasswordResetEmail(email) {
    await firebaseSendPasswordResetEmail(auth, email);
  },

  async changePassword(currentPassword, newPassword) {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await firebaseUpdatePassword(user, newPassword);
  },

  onAuthStateChanged(callback) {
    return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await fetchUserProfile(firebaseUser.uid);
          callback(profile ?? { uid: firebaseUser.uid, email: firebaseUser.email, role: 'developer' });
        } catch {
          callback({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'developer' });
        }
      } else {
        callback(null);
      }
    });
  },
};
