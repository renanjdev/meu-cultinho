/**
 * data/seedFirestore.ts — idempotent Firestore seeding for development.
 *
 * Ports the legacy fictional records (GROUPS / YOUTH / AUX) onto the current
 * Firestore document shapes (config/grupos/jovens/auxiliares). The function
 * signs in as the admin first (creating the admin account if missing) so the
 * Firestore security rules — which require `request.auth != null` — are met.
 *
 * Idempotency: once `config/congregation` exists the function returns early,
 * and per-auxiliary account creation tolerates already-existing users. Safe to
 * call more than once.
 */
import { doc, getDoc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { auth, db } from '../services/firebase';
import { signIn, createAuxiliarAccount } from '../services/auth';
import { GROUPS, YOUTH, AUX } from './seed';

const ADMIN_USERNAME = 'renan.j';

// Legacy AUX records are keyed by their `id` (a1..a5). Map each to the username
// the new account system expects.
const AUX_USERNAME: Record<string, string> = {
  a1: 'renan.j',
  a2: 'lucas.s',
  a3: 'noemi.f',
  a4: 'cledson.o',
  a5: 'isabela.l',
};

export async function seedFirestore(adminPassword: string, auxPassword = '123456'): Promise<void> {
  // 1. Ensure the admin is signed in (creating the account on first run). After
  //    this block the primary app is authenticated as the admin, satisfying the
  //    Firestore rules.
  try {
    await signIn(ADMIN_USERNAME, adminPassword);
  } catch {
    await createAuxiliarAccount(ADMIN_USERNAME, adminPassword);
    await signIn(ADMIN_USERNAME, adminPassword);
  }
  const adminUid = auth.currentUser?.uid;
  if (!adminUid) throw new Error('Seed aborted: admin sign-in did not produce a user.');

  // 2. Idempotency guard — if the congregation config already exists we assume
  //    the database was seeded before and bail out.
  const cfg = await getDoc(doc(db, 'config', 'congregation'));
  if (cfg.exists()) return;

  // 3. Congregation config.
  await setDoc(doc(db, 'config', 'congregation'), {
    name: 'Central',
    createdAt: serverTimestamp(),
  });

  // 4. Admin auxiliary document (AUX[0] = Renan Januário).
  const admin = AUX[0];
  await setDoc(doc(db, 'auxiliares', adminUid), {
    name: admin.name,
    username: ADMIN_USERNAME,
    role: 'admin',
    phone: admin.phone,
    birth: admin.birth,
    baptism: admin.baptism,
    presented: admin.presented,
    groupIds: [],
    status: 'Ativo',
    createdAt: serverTimestamp(),
  });

  // 5. Remaining auxiliaries. Each gets an Auth account (via the secondary app,
  //    so the primary session stays as admin) and an `auxiliares/{uid}` doc.
  //    A pre-existing account throws on creation — skip those.
  for (const a of AUX.slice(1)) {
    const username = AUX_USERNAME[a.id];
    if (!username) continue;
    let uid: string;
    try {
      uid = await createAuxiliarAccount(username, auxPassword);
    } catch {
      // Account already exists — its uid is unknown here, so skip the doc.
      continue;
    }
    await setDoc(doc(db, 'auxiliares', uid), {
      name: a.name,
      username,
      role: 'auxiliar',
      phone: a.phone,
      birth: a.birth,
      baptism: a.baptism,
      presented: a.presented,
      groupIds: [],
      status: 'Ativo',
      createdAt: serverTimestamp(),
    });
  }

  // 6. Groups (g1..g6), adapted to the new shape (no count/last/freq).
  for (const g of GROUPS) {
    await setDoc(doc(db, 'grupos', g.id), {
      name: g.name,
      short: g.short,
      description: '',
      aux: g.aux,
      icon: g.icon,
      status: 'Ativo',
      createdAt: serverTimestamp(),
    });
  }

  // 7. Youth (j1..j10), adapted to the new shape (group -> groupId; no
  //    age/last/freq/present/absent).
  for (const y of YOUTH) {
    await setDoc(doc(db, 'jovens', y.id), {
      name: y.name,
      birth: y.birth,
      sex: y.sex,
      groupId: y.group,
      father: y.father,
      mother: y.mother,
      phone: y.phone,
      address: y.address,
      notes: y.notes,
      status: y.status,
      createdAt: serverTimestamp(),
    });
  }
}
