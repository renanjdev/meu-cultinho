/**
 * services/auth.ts — authentication actions.
 *
 * Usernames are mapped to internal emails before hitting Firebase. Creating an
 * auxiliary account uses a throwaway secondary app instance so the admin's own
 * session is not replaced by the newly-created user.
 */
import { initializeApp, getApp, deleteApp } from '@react-native-firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from '@react-native-firebase/auth';
import { auth } from './firebase';
import { usernameToEmail } from './usernames';

export function signIn(username: string, password: string) {
  return signInWithEmailAndPassword(auth, usernameToEmail(username), password);
}

export function signOutUser() {
  return signOut(auth);
}

export async function createAuxiliarAccount(username: string, password: string): Promise<string> {
  const secondary = await initializeApp(getApp().options, 'secondary');
  try {
    const cred = await createUserWithEmailAndPassword(getAuth(secondary), usernameToEmail(username), password);
    await signOut(getAuth(secondary));
    return cred.user.uid;
  } finally {
    await deleteApp(secondary);
  }
}
