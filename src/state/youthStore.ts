/**
 * state/youthStore.ts — tiny reactive store for the youth roster.
 *
 * The prototype used a module-level array plus a Set of subscribers so the
 * Lista de Jovens updates live when a youth is created or deleted. Ported to
 * React's useSyncExternalStore, which is the idiomatic way to subscribe a
 * component to an external mutable source.
 */
import { useSyncExternalStore } from 'react';
import { YOUTH, type Youth } from '../data/seed';

let roster: Youth[] = YOUTH.slice();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

const getSnapshot = () => roster;

/** Reactive read — re-renders the calling component on any roster change. */
export function useYouthStore(): Youth[] {
  return useSyncExternalStore(subscribe, getSnapshot);
}

/** Non-reactive read by id (detail screen navigates away after mutating). */
export function getYouth(id: string | undefined): Youth | undefined {
  return roster.find((j) => j.id === id);
}

export function deleteYouth(id: string): void {
  roster = roster.filter((j) => j.id !== id);
  emit();
}

export type NewYouth = Partial<Youth> & Pick<Youth, 'name'>;

export function addYouth(input: NewYouth): void {
  const youth: Youth = {
    id: 'j' + Date.now(),
    age: 0,
    group: 'g1',
    status: 'Ativo',
    last: 'Pendente',
    freq: 0,
    present: 0,
    absent: 0,
    birth: '',
    sex: 'Masculino',
    father: '',
    mother: '',
    phone: '',
    address: '',
    notes: '',
    ...input,
  };
  roster = [youth, ...roster];
  emit();
}
