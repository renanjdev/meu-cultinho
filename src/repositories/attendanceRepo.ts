import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, setDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { db } from '../services/firebase';

export const meetingId = (date: string, groupId: string) => `${date}_${groupId}`;

export async function markPresence(date: string, groupId: string, youthId: string, status: 'present' | 'absent', markedBy: string) {
  const mId = meetingId(date, groupId);
  await setDoc(doc(db, 'reunioes', mId), { date, groupId, createdBy: markedBy, createdAt: serverTimestamp() }, { merge: true });
  await setDoc(doc(db, 'reunioes', mId, 'presencas', youthId), { status, markedBy, markedAt: serverTimestamp() }, { merge: true });
}

export function useMeetingMarks(date: string, groupId: string): Record<string, 'present' | 'absent'> {
  const [marks, setMarks] = useState<Record<string, 'present' | 'absent'>>({});
  useEffect(() => onSnapshot(collection(db, 'reunioes', meetingId(date, groupId), 'presencas'), (s) => {
    const m: Record<string, 'present' | 'absent'> = {};
    s.forEach((d) => { m[d.id] = (d.data() as { status: 'present' | 'absent' }).status; });
    setMarks(m);
  }), [date, groupId]);
  return marks;
}
