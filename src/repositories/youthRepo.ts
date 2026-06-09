import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, orderBy, setDoc, deleteDoc, serverTimestamp, type DocumentSnapshot } from '@react-native-firebase/firestore';
import { db } from '../services/firebase';
import type { Youth } from '../data/types';

const fromDoc = (d: DocumentSnapshot): Youth => ({ id: d.id, ...(d.data() as Omit<Youth, 'id'>) });

export function useYouthList(): Youth[] {
  const [items, setItems] = useState<Youth[]>([]);
  useEffect(() => onSnapshot(query(collection(db, 'jovens'), orderBy('name')), (s) => setItems(s.docs.map(fromDoc))), []);
  return items;
}
export function useYouth(id: string | undefined): Youth | undefined {
  const [item, setItem] = useState<Youth | undefined>(undefined);
  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, 'jovens', id), (d) => setItem(d.exists() ? fromDoc(d) : undefined));
  }, [id]);
  return item;
}
export function saveYouth(y: Partial<Youth> & { id?: string }) {
  const ref = y.id ? doc(db, 'jovens', y.id) : doc(collection(db, 'jovens'));
  const { id, ...data } = y;
  return setDoc(ref, { ...data, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
}
export function deleteYouthDoc(id: string) { return deleteDoc(doc(db, 'jovens', id)); }
