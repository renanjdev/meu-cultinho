/**
 * hooks/useAuth.ts — subscribes to the Firebase auth state and resolves the
 * current user's role/name from the `auxiliares` collection.
 *
 * Returns `loading` until the first auth state callback fires, then `session`
 * (or null when signed out).
 */
import { useEffect, useState } from 'react';
import { onAuthStateChanged, type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { doc, getDoc } from '@react-native-firebase/firestore';
import { auth, db } from '../services/firebase';
import type { AuxRole } from '../data/types';

export interface Session {
  uid: string;
  role: AuxRole;
  name: string;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(
    () =>
      onAuthStateChanged(auth, async (user: FirebaseAuthTypes.User | null) => {
        if (!user) {
          setSession(null);
          setLoading(false);
          return;
        }
        const snap = await getDoc(doc(db, 'auxiliares', user.uid));
        const data = snap.data();
        setSession({ uid: user.uid, role: (data?.role as AuxRole) ?? 'auxiliar', name: data?.name ?? '' });
        setLoading(false);
      }),
    [],
  );
  return { session, loading };
}
