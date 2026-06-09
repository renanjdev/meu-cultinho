# Meu Cultinho — Fase 1 (Núcleo funcional) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o protótipo em app funcional com Firebase nativo: login real (usuário/senha), CRUD persistido de jovens/grupos/auxiliares, registro de frequência offline-first e fotos dos membros.

**Architecture:** O app Expo atual ganha uma camada `services/` (Firebase init, auth, fotos, rede) e `repositories/` (hooks reativos sobre o Firestore). As telas trocam os dados mock pelos repositórios. Firestore do `@react-native-firebase` persiste offline em disco; fotos têm fila de upload própria.

**Tech Stack:** Expo (dev build), `@react-native-firebase/{app,auth,firestore,storage}`, `expo-image-picker`, `expo-image-manipulator`, `@react-native-community/netinfo`, Jest (`jest-expo`).

**Observação sobre testes:** `@react-native-firebase` são módulos nativos — não rodam em Jest puro. Por isso **TDD real** é aplicado às unidades de **lógica pura** (mapeamento usuário↔e-mail, idade, fila de fotos, conversores). Tarefas de setup/Firestore/UI usam **verificação concreta no dev build** (passos "rode o app, faça X, observe Y"). Isso é proposital, não preguiça.

---

## Marco 0 — Setup de infraestrutura

### Task 0.1: Projeto Firebase (ações do usuário)

**Files:** nenhum (console Firebase).

- [ ] **Passo 1:** No [Firebase Console](https://console.firebase.google.com), criar projeto "Meu Cultinho".
- [ ] **Passo 2:** Adicionar app **Android** com package `com.meucultinho.app`. Baixar o `google-services.json`.
- [ ] **Passo 3:** Ativar **Authentication → Sign-in method → E-mail/senha**.
- [ ] **Passo 4:** Criar o **Firestore Database** (modo produção, região `southamerica-east1`).
- [ ] **Passo 5:** Criar o **Storage** (pede ativar o plano **Blaze**; uso fica grátis).
- [ ] **Passo 6:** Colocar o `google-services.json` em `C:\Users\Renan\Desktop\clone\cultinho\google-services.json`.

### Task 0.2: Instalar dependências

**Files:** Modify: `package.json` (via CLI).

- [ ] **Passo 1:** Instalar pacotes nativos do Firebase e utilidades:
```bash
npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage expo-dev-client expo-image-picker expo-image-manipulator @react-native-community/netinfo expo-build-properties
```
- [ ] **Passo 2:** Instalar Jest (dev):
```bash
npx expo install -- --save-dev jest jest-expo @types/jest
```
- [ ] **Passo 3:** Verificar: `npx tsc --noEmit -p tsconfig.json` → `TSC_EXIT=0`.

### Task 0.3: Configurar `app.json` para Firebase nativo

**Files:** Modify: `app.json`.

- [ ] **Passo 1:** Adicionar o caminho do google-services e os config plugins. Em `expo.android`, adicionar `"googleServicesFile": "./google-services.json"`. Em `expo.plugins`, adicionar:
```json
"@react-native-firebase/app",
"@react-native-firebase/auth",
[
  "expo-build-properties",
  { "android": { "compileSdkVersion": 35, "targetSdkVersion": 35 } }
],
[
  "expo-image-picker",
  { "photosPermission": "O app usa suas fotos para definir a imagem do membro.", "cameraPermission": "O app usa a câmera para tirar a foto do membro." }
]
```
- [ ] **Passo 2:** Verificar JSON válido: `node -e "require('./app.json')"` → sem erro.

### Task 0.4: Configurar Jest

**Files:** Create: `jest.config.js`; Modify: `package.json` (script `test`).

- [ ] **Passo 1:** Criar `jest.config.js`:
```js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@react-navigation/.*|@react-native-firebase/.*))',
  ],
};
```
- [ ] **Passo 2:** Em `package.json` scripts, adicionar `"test": "jest"`.
- [ ] **Passo 3:** Verificar: `npm test -- --passWithNoTests` → exit 0.

### Task 0.5: Primeiro dev build no Android

**Files:** nenhum (EAS).

- [ ] **Passo 1:** `npx eas-cli@latest login` (ou `npx eas login`).
- [ ] **Passo 2:** `npx eas build --profile development --platform android` (gera o APK de desenvolvimento).
- [ ] **Passo 3:** Instalar o APK no Android, rodar `npx expo start --dev-client` e abrir.
- [ ] **Passo 4:** **Verificar:** o app abre na Splash (telas atuais ainda com mock). Confirma que o dev build funciona antes de plugar dados.

---

## Marco 1 — Autenticação real

### Task 1.1: Tipos de domínio

**Files:** Create: `src/data/types.ts`.

- [ ] **Passo 1:** Mover os tipos de `src/data/seed.ts` para `src/data/types.ts` (sem os arrays). Conteúdo:
```ts
export type GroupIconName = 'baby' | 'book' | 'users';
export type YouthStatus = 'Ativo' | 'Inativo';
export type AttendanceMark = 'Presente' | 'Falta' | 'Pendente';
export type AuxRole = 'admin' | 'auxiliar';

export interface Group { id: string; name: string; short: string; description?: string; aux: string; auxId?: string; icon: GroupIconName; status: YouthStatus; }
export interface Youth { id: string; name: string; birth: string; sex: 'Masculino' | 'Feminino'; groupId: string; father: string; mother: string; phone: string; address: string; notes: string; status: YouthStatus; photoUrl?: string; }
export interface Aux { id: string; name: string; username: string; role: AuxRole; phone: string; birth: string; baptism: string; presented: string; groupIds: string[]; status: YouthStatus; photoUrl?: string; }
```
- [ ] **Passo 2:** Verificar: `npx tsc --noEmit` → 0 (ainda há `seed.ts`; coexistem nesta etapa).

### Task 1.2: Mapeamento usuário↔e-mail (LÓGICA PURA — TDD)

**Files:** Create: `src/services/usernames.ts`; Test: `src/services/usernames.test.ts`.

- [ ] **Passo 1: Escrever o teste que falha:**
```ts
import { usernameToEmail, emailToUsername } from './usernames';
test('usuario vira email interno em minúsculas', () => {
  expect(usernameToEmail(' Lucas.S ')).toBe('lucas.s@meucultinho.app');
});
test('email interno volta pra usuario', () => {
  expect(emailToUsername('lucas.s@meucultinho.app')).toBe('lucas.s');
});
```
- [ ] **Passo 2: Rodar e ver falhar:** `npm test -- usernames` → FAIL ("Cannot find module './usernames'").
- [ ] **Passo 3: Implementar:**
```ts
export const INTERNAL_DOMAIN = 'meucultinho.app';
export const usernameToEmail = (u: string) => `${u.trim().toLowerCase()}@${INTERNAL_DOMAIN}`;
export const emailToUsername = (e: string) => e.replace(`@${INTERNAL_DOMAIN}`, '');
```
- [ ] **Passo 4: Rodar e ver passar:** `npm test -- usernames` → PASS.
- [ ] **Passo 5: Commit:** `git add src/services/usernames.* && git commit -m "feat(auth): mapeamento usuario<->email interno"`

### Task 1.3: Init do Firebase

**Files:** Create: `src/services/firebase.ts`.

- [ ] **Passo 1: Implementar** (API modular do @react-native-firebase):
```ts
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getStorage } from '@react-native-firebase/storage';

export const app = getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// Offline persistence do Firestore já vem LIGADA por padrão no Android.
```
- [ ] **Passo 2: Verificar no dev build:** importar `db` em qualquer tela temporariamente e logar `db.app.name` → "[DEFAULT]" no console do Metro. Remover o log.

### Task 1.4: Serviço de auth

**Files:** Create: `src/services/auth.ts`.

- [ ] **Passo 1: Implementar:**
```ts
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
/** Cria a conta do auxiliar SEM deslogar o admin (usa app secundário). */
export async function createAuxiliarAccount(username: string, password: string): Promise<string> {
  const secondary = initializeApp(getApp().options, 'secondary');
  try {
    const cred = await createUserWithEmailAndPassword(getAuth(secondary), usernameToEmail(username), password);
    await signOut(getAuth(secondary));
    return cred.user.uid;
  } finally {
    await deleteApp(secondary);
  }
}
```
- [ ] **Passo 2: Verificar:** `npx tsc --noEmit` → 0.

### Task 1.5: Hook de sessão `useAuth`

**Files:** Create: `src/hooks/useAuth.ts`; Modify: `src/theme/ThemeProvider.tsx` (expor papel vindo do banco — ver passo 3).

- [ ] **Passo 1: Implementar o hook:**
```ts
import { useEffect, useState } from 'react';
import { onAuthStateChanged, type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { doc, getDoc } from '@react-native-firebase/firestore';
import { auth, db } from '../services/firebase';
import type { AuxRole } from '../data/types';

export interface Session { uid: string; role: AuxRole; name: string; }

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => onAuthStateChanged(auth, async (user: FirebaseAuthTypes.User | null) => {
    if (!user) { setSession(null); setLoading(false); return; }
    const snap = await getDoc(doc(db, 'auxiliares', user.uid));
    const data = snap.data();
    setSession({ uid: user.uid, role: (data?.role as AuxRole) ?? 'auxiliar', name: data?.name ?? '' });
    setLoading(false);
  }), []);
  return { session, loading };
}
```
- [ ] **Passo 2: Verificar:** `npx tsc --noEmit` → 0.

### Task 1.6: Auth gate no App + Login real

**Files:** Modify: `App.tsx`; Modify: `src/screens/LoginScreen.tsx`.

- [ ] **Passo 1: No `App.tsx`**, dentro do `RootNavigator`, usar `useAuth()`: enquanto `loading`, mostrar `BootScreen`; se `!session`, `initialRouteName="Login"` e registrar só `Splash`/`Login`; se `session`, registrar todas as telas e `initialRouteName` = `AdminHome`/`AuxHome` conforme `session.role`. (Manter as telas já registradas; só controlar `initialRouteName` e esconder as internas quando deslogado.)
- [ ] **Passo 2: No `LoginScreen.tsx`**, trocar os dois botões por chamada real:
```ts
import { signIn } from '../services/auth';
// estado de erro:
const [erro, setErro] = useState('');
// no onPress do "Entrar":
onPress={async () => {
  try { setErro(''); await signIn(user, pass); } // a navegação acontece pelo auth gate
  catch { setErro('Usuário ou senha inválidos.'); }
}}
```
Mostrar `erro` abaixo dos campos quando preenchido. Remover o botão "Entrar como auxiliar" (agora o papel vem do banco) ou mantê-lo como atalho de teste até o seed existir.
- [ ] **Passo 3: Verificar no dev build:** sem usuário ainda não dá pra logar; isso é validado na Task 1.7.

### Task 1.7: Seed do admin inicial + dados fictícios

**Files:** Create: `src/data/seedFirestore.ts`; Create: `scripts/seed.md` (instruções).

- [ ] **Passo 1: Implementar `seedFirestore()`** que cria, se não existirem: o doc `config/congregation` (`{name:'Central'}`), os 6 grupos, os 10 jovens e os 5 auxiliares (reaproveitando os dados de `seed.ts` antigo, adaptados ao novo shape), e o **admin inicial** via `createAuxiliarAccount('renan.j','<senha>')` seguido de `setDoc(doc(db,'auxiliares',uid), {role:'admin', name:'Renan Januário', username:'renan.j', ...})`. Guardas: checar existência antes de criar (idempotente).
- [ ] **Passo 2:** Chamar `seedFirestore()` uma vez atrás de um botão escondido de dev (ou um `useEffect` temporário) no dev build. Documentar em `scripts/seed.md`.
- [ ] **Passo 3: Verificar no dev build:** rodar o seed; conferir no Firebase Console que `auxiliares`, `grupos`, `jovens` foram populados e que existe o usuário `renan.j@meucultinho.app` em Authentication.
- [ ] **Passo 4: Verificar login:** na tela de Login, entrar com `renan.j` + senha → o auth gate leva pra Home Admin. **Critério de aceite do Marco 1.**
- [ ] **Passo 5: Commit.**

### Task 1.8: Unificar o papel (role) na sessão

**Files:** Modify: `src/theme/ThemeProvider.tsx`, `src/screens/AdminHome.tsx`, `AuxHome.tsx`, `YouthList.tsx`, `Settings.tsx`.

Motivo: o protótipo usa `role: 'admin'|'aux'` no `ThemeProvider`; o backend define `AuxRole = 'admin'|'auxiliar'` (Task 1.1). Padronizar em **`'admin'|'auxiliar'`** vindo do `useAuth`, e tirar o papel do `ThemeProvider` (que passa a cuidar só do tema).

- [ ] **Passo 1:** Em `ThemeProvider.tsx`, remover `role`/`setRole` e o tipo `Role`; manter só tema. (Quem precisar de papel usa `useAuth().session.role`.)
- [ ] **Passo 2:** `AdminHome.tsx` e `AuxHome.tsx`: remover os `useEffect(() => setRole(...))` (a home inicial já é decidida pelo auth gate da Task 1.6).
- [ ] **Passo 3:** `YouthList.tsx` e `Settings.tsx`: trocar `const { role } = useApp()` por `const { session } = useAuth()` e comparar `session?.role === 'auxiliar'` (no lugar de `'aux'`) para o botão voltar / esconder a bottom nav / escolher os itens da nav.
- [ ] **Passo 4: Verificar:** `npx tsc --noEmit` → 0; logado como `renan.j` (admin) vê a nav de admin. (Após o seed criar um auxiliar, logar como auxiliar mostra a nav reduzida.)
- [ ] **Passo 5: Commit.**

---

## Marco 2 — Dados reais (CRUD persistido)

### Task 2.1: Repositório de grupos

**Files:** Create: `src/repositories/groupRepo.ts`.

- [ ] **Passo 1: Implementar** hooks/escritas:
```ts
import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, orderBy, setDoc, deleteDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { db } from '../services/firebase';
import type { Group } from '../data/types';

const fromDoc = (d: any): Group => ({ id: d.id, ...(d.data() as Omit<Group,'id'>) });

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  useEffect(() => onSnapshot(query(collection(db, 'grupos'), orderBy('name')), s => setGroups(s.docs.map(fromDoc))), []);
  return groups;
}
export function saveGroup(g: Partial<Group> & { id?: string }) {
  const ref = g.id ? doc(db, 'grupos', g.id) : doc(collection(db, 'grupos'));
  return setDoc(ref, { ...g, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
}
export function deleteGroup(id: string) { return deleteDoc(doc(db, 'grupos', id)); }
```
- [ ] **Passo 2: Verificar:** `npx tsc --noEmit` → 0.

### Task 2.2: Repositório de jovens

**Files:** Create: `src/repositories/youthRepo.ts`.

- [ ] **Passo 1: Implementar** seguindo o mesmo padrão da Task 2.1, coleção `jovens`, com `useYouthList()`, `useYouth(id)` (via `onSnapshot` de um doc), `saveYouth(data)`, `deleteYouthDoc(id)`. (Código completo análogo ao groupRepo, trocando tipo/coleção; incluir `useYouth` com `doc()` + `onSnapshot`.)
- [ ] **Passo 2: Verificar:** `npx tsc --noEmit` → 0.

### Task 2.3: Repositório de auxiliares

**Files:** Create: `src/repositories/auxRepo.ts`.

- [ ] **Passo 1: Implementar** `useAuxList()` (coleção `auxiliares`), `saveAuxProfile(uid, data)` (update do próprio doc, `merge:true`) e `createAux(data, senha)` que chama `createAuxiliarAccount(data.username, senha)` e grava o doc `auxiliares/{uid}` com `role:'auxiliar'`.
- [ ] **Passo 2: Verificar:** `npx tsc --noEmit` → 0.

### Task 2.4: Derivação de idade (LÓGICA PURA — TDD)

**Files:** Create: `src/data/age.ts`; Test: `src/data/age.test.ts`.

- [ ] **Passo 1: Teste que falha:**
```ts
import { ageFrom } from './age';
test('idade a partir de dd/mm/aaaa', () => {
  expect(ageFrom('14/03/2020', new Date('2026-06-09'))).toBe(6);
  expect(ageFrom('10/12/2020', new Date('2026-06-09'))).toBe(5);
});
```
- [ ] **Passo 2: Rodar e ver falhar:** `npm test -- age` → FAIL.
- [ ] **Passo 3: Implementar:**
```ts
export function ageFrom(birth: string, now: Date = new Date()): number {
  const [d, m, y] = birth.split('/').map(Number);
  if (!d || !m || !y) return 0;
  let age = now.getFullYear() - y;
  const before = now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d);
  return before ? age - 1 : age;
}
```
- [ ] **Passo 4: Rodar e ver passar.** `npm test -- age` → PASS.
- [ ] **Passo 5: Commit.**

### Task 2.5: Ligar telas de lista/form/detalhe aos repositórios

**Files:** Modify: `src/screens/YouthList.tsx`, `YouthForm.tsx`, `YouthDetail.tsx`, `GroupList.tsx`, `GroupForm.tsx`, `AuxList.tsx`, `AuxForm.tsx`.

- [ ] **Passo 1:** `YouthList`: trocar `useYouthStore()` por `useYouthList()`; usar `ageFrom(j.birth)` na exibição.
- [ ] **Passo 2:** `YouthForm`: `onPress` salvar chama `saveYouth({...f})` (sem `name` fallback inválido: validar nome não-vazio, mostrar erro inline se vazio); volta com `back()`.
- [ ] **Passo 3:** `YouthDetail`: ler via `useYouth(route.params.id)`; "Excluir" chama `deleteYouthDoc(id)`.
- [ ] **Passo 4:** `GroupList`/`GroupForm` usam `useGroups()`/`saveGroup()`; `AuxList`/`AuxForm` usam `useAuxList()`/`createAux()`.
- [ ] **Passo 5: Verificar no dev build:** cadastrar um jovem novo → aparece na lista e no Firebase Console; editar → muda; excluir → some. Em dois aparelhos logados, a lista reflete a mudança. **Critério de aceite do Marco 2.**
- [ ] **Passo 6: Commit.**

---

## Marco 3 — Frequência offline-first

### Task 3.1: ID idempotente de reunião (LÓGICA PURA — TDD)

**Files:** Create: `src/repositories/attendanceRepo.ts`; Test: `src/repositories/attendanceRepo.test.ts`.

- [ ] **Passo 1: Teste que falha** (só a função pura `meetingId`):
```ts
import { meetingId } from './attendanceRepo';
test('id da reunião é deterministico por data+grupo', () => {
  expect(meetingId('2026-06-08', 'g5')).toBe('2026-06-08_g5');
});
```
- [ ] **Passo 2: Rodar e ver falhar.** `npm test -- attendanceRepo` → FAIL.
- [ ] **Passo 3: Implementar** o repo (a função pura + as escritas):
```ts
import { doc, setDoc, serverTimestamp, collection, onSnapshot } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';

export const meetingId = (date: string, groupId: string) => `${date}_${groupId}`;

export async function markPresence(date: string, groupId: string, youthId: string, status: 'present'|'absent', markedBy: string) {
  const mId = meetingId(date, groupId);
  await setDoc(doc(db, 'reunioes', mId), { date, groupId, createdBy: markedBy, createdAt: serverTimestamp() }, { merge: true });
  await setDoc(doc(db, 'reunioes', mId, 'presencas', youthId), { status, markedBy, markedAt: serverTimestamp() }, { merge: true });
}
export function useMeetingMarks(date: string, groupId: string) {
  const [marks, setMarks] = useState<Record<string, 'present'|'absent'>>({});
  useEffect(() => onSnapshot(collection(db, 'reunioes', meetingId(date, groupId), 'presencas'),
    s => { const m: any = {}; s.forEach(d => { m[d.id] = d.data().status; }); setMarks(m); }), [date, groupId]);
  return marks;
}
```
- [ ] **Passo 4: Rodar e ver passar.** `npm test -- attendanceRepo` → PASS (a parte pura).
- [ ] **Passo 5: Commit.**

### Task 3.2: Ligar a tela de Frequência

**Files:** Modify: `src/screens/Attendance.tsx`.

- [ ] **Passo 1:** `roster` passa a vir de `useYouthList()` filtrado por grupo+ativo. Usar `useMeetingMarks(date, grp)` como estado base e `markPresence(...)` no toque dos botões (a UI continua otimista: atualiza local e grava). `markedBy` = `session.uid` (via `useAuth`).
- [ ] **Passo 2: Verificar offline no dev build:** ativar **modo avião**, marcar presenças (cards ficam verdes/vermelhos normalmente), fechar e reabrir o app ainda offline → marcações continuam lá; **desativar o avião** → conferir no Console que `reunioes/{data_grupo}/presencas` sincronizou. **Critério de aceite do Marco 3.**
- [ ] **Passo 3: Commit.**

---

## Marco 4 — Fotos dos membros

### Task 4.1: Estado de rede

**Files:** Create: `src/services/net.ts`.

- [ ] **Passo 1: Implementar** um hook `useIsOnline()` com `@react-native-community/netinfo` (`addEventListener` → `state.isConnected`).
- [ ] **Passo 2: Verificar:** `npx tsc --noEmit` → 0.

### Task 4.2: Caminho da foto + decisão de pendência (LÓGICA PURA — TDD)

**Files:** Create: `src/services/photoPaths.ts`; Test: `src/services/photoPaths.test.ts`.

- [ ] **Passo 1: Teste que falha:**
```ts
import { storagePath } from './photoPaths';
test('caminho de storage por tipo e id', () => {
  expect(storagePath('jovens', 'j1')).toBe('jovens/j1.jpg');
  expect(storagePath('auxiliares', 'uid9')).toBe('auxiliares/uid9.jpg');
});
```
- [ ] **Passo 2: Rodar e ver falhar.** `npm test -- photoPaths` → FAIL.
- [ ] **Passo 3: Implementar:**
```ts
export function storagePath(kind: 'jovens' | 'auxiliares', id: string) { return `${kind}/${id}.jpg`; }
```
- [ ] **Passo 4: Rodar e ver passar; Commit.**

### Task 4.3: Serviço de fotos (escolher, comprimir, subir, fila offline)

**Files:** Create: `src/services/photos.ts`.

- [ ] **Passo 1: Implementar:**
  - `pickAndCompress()`: `ImagePicker.launchImageLibraryAsync`/`launchCameraAsync` → `ImageManipulator` resize (ex. 512px) + compress 0.7 → retorna `localUri`.
  - `uploadPhoto(kind, id, localUri)`: `storage().ref(storagePath(kind,id)).putFile(localUri)` → `getDownloadURL()` → grava `photoUrl` no doc e limpa `photoPending`.
  - `setPhoto(kind, id, localUri, isOnline)`: se online, `uploadPhoto`; se offline, grava `photoPending: localUri` no doc e mantém o arquivo local.
  - `flushPendingPhotos()`: varre docs com `photoPending` e chama `uploadPhoto` (chamado quando a rede volta, via `net.ts`).
- [ ] **Passo 2: Verificar:** `npx tsc --noEmit` → 0.

### Task 4.4: Avatar com foto

**Files:** Modify: `src/components/ui.tsx` (componente `Avatar`).

- [ ] **Passo 1:** `Avatar` recebe `photoUri?: string`. Se houver, renderiza `<Image source={{uri: photoUri}} style={{width,height,borderRadius:size/2}}/>`; senão, mantém as iniciais coloridas atuais.
- [ ] **Passo 2: Verificar:** `npx tsc --noEmit` → 0.

### Task 4.5: Integrar fotos nas telas

**Files:** Modify: `src/screens/YouthForm.tsx`, `YouthDetail.tsx`, `YouthList.tsx`, `Settings.tsx`, `AuxForm.tsx`.

- [ ] **Passo 1:** `YouthForm` e `AuxForm`: botão "Adicionar foto" → `pickAndCompress()` → preview; ao salvar, `setPhoto('jovens'|'auxiliares', id, uri, isOnline)`.
- [ ] **Passo 2:** `Avatar` recebe `photoUri={j.photoUrl ?? j.photoPending}` em `YouthList`, `YouthDetail`, `Settings`.
- [ ] **Passo 3:** Em `net.ts`/App, chamar `flushPendingPhotos()` quando `isOnline` virar true.
- [ ] **Passo 4: Verificar no dev build:** adicionar foto a um jovem com internet → aparece no avatar e no Storage. Offline: adicionar foto → mostra a local; voltar online → sobe sozinha. **Critério de aceite do Marco 4.**
- [ ] **Passo 5: Commit.**

---

## Marco 5 — Limpeza

### Task 5.1: Remover mock

**Files:** Delete: `src/data/seed.ts`, `src/state/youthStore.ts`. Modify: imports remanescentes.

- [ ] **Passo 1:** Remover os arquivos; corrigir qualquer import quebrado (dados fictícios agora vivem no Firestore via seed).
- [ ] **Passo 2: Verificar:** `npx tsc --noEmit` → 0; `npm test` → tudo verde; abrir o app no dev build e navegar (login, listas, frequência, fotos). 
- [ ] **Passo 3: Commit.**

---

## Critérios de aceite (Fase 1)

- Dois aparelhos logados veem os mesmos dados em tempo real.
- Presença marcada offline (com app fechado e reaberto) sincroniza ao reconectar.
- Foto de jovem e de perfil aparecem; upload offline sobe ao voltar a internet.
- Criar auxiliar não desloga o admin.
- `npx tsc --noEmit` e `npm test` verdes.
