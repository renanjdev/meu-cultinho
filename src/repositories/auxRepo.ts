import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, orderBy, setDoc, serverTimestamp, type DocumentSnapshot } from '@react-native-firebase/firestore';
import { db } from '../services/firebase';
import { createAuxiliarAccount } from '../services/auth';
import type { Aux } from '../data/types';

const fromDoc = (d: DocumentSnapshot): Aux => ({ id: d.id, ...(d.data() as Omit<Aux, 'id'>) });

export function useAuxList(): Aux[] {
  const [items, setItems] = useState<Aux[]>([]);
  useEffect(() => onSnapshot(query(collection(db, 'auxiliares'), orderBy('name')), (s) => setItems(s.docs.map(fromDoc))), []);
  return items;
}
export function saveAuxProfile(uid: string, data: Partial<Aux>) {
  const { id, ...rest } = data;
  return setDoc(doc(db, 'auxiliares', uid), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
}
export async function createAux(data: Omit<Aux, 'id'>, password: string): Promise<void> {
  const uid = await createAuxiliarAccount(data.username, password);
  await setDoc(doc(db, 'auxiliares', uid), { ...data, createdAt: serverTimestamp() }, { merge: true });
}
