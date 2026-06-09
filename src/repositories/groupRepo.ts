import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, orderBy, setDoc, deleteDoc, serverTimestamp, type DocumentSnapshot } from '@react-native-firebase/firestore';
import { db } from '../services/firebase';
import type { Group } from '../data/types';

const fromDoc = (d: DocumentSnapshot): Group => ({ id: d.id, ...(d.data() as Omit<Group, 'id'>) });

export function useGroups(): Group[] {
  const [groups, setGroups] = useState<Group[]>([]);
  useEffect(() => onSnapshot(query(collection(db, 'grupos'), orderBy('name')), (s) => setGroups(s.docs.map(fromDoc))), []);
  return groups;
}
export function saveGroup(g: Partial<Group> & { id?: string }) {
  const ref = g.id ? doc(db, 'grupos', g.id) : doc(collection(db, 'grupos'));
  const { id, ...data } = g;
  return setDoc(ref, { ...data, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
}
export function deleteGroup(id: string) { return deleteDoc(doc(db, 'grupos', id)); }
