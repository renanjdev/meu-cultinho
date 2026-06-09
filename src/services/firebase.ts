/**
 * services/firebase.ts — shared Firebase instances.
 *
 * Resolves the default app (configured by the native @react-native-firebase
 * config files) and exposes the auth, firestore, and storage handles the rest
 * of the app builds on top of.
 */
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getStorage } from '@react-native-firebase/storage';

export const app = getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
