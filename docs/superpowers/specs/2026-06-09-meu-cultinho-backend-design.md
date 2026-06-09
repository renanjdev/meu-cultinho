# Meu Cultinho — Backend e funcionalidade real (design)

_Data: 2026-06-09 · Status: aguardando revisão do usuário_

## 1. Objetivo

Transformar o protótipo (15 telas, dados fictícios em memória, login falso) num app
**funcional de verdade**: login real, banco de dados na nuvem, persistência de jovens,
auxiliares, grupos e frequência, fotos dos membros, e relatórios calculados a partir dos
dados reais. Funcionamento **offline-first** (registrar presença sem internet e sincronizar
depois) e dados **compartilhados entre vários celulares** (admin + auxiliares).

## 2. Decisões fechadas (com o usuário)

| Tema | Decisão |
|---|---|
| Banco / Auth / Arquivos | **Firebase** (Firestore + Auth + Storage) |
| SDK | **`@react-native-firebase`** (nativo) — offline robusto em disco |
| Build / teste | **Development build** via EAS (não mais Expo Go nem web) |
| Login | **Usuário + senha**, mapeado internamente para `usuario@meucultinho.app` |
| Abrangência | **Uma congregação** (single-tenant) |
| Offline | **Sim, importante** — escrita offline persistente + sincronização automática |
| Fotos | Jovens (cadastro/detalhe) e perfil do auxiliar, no **Firebase Storage** |
| Custo | Plano **Blaze** do Firebase, dentro da cota gratuita (uso real ≈ R$0) |

## 3. Arquitetura

O app Expo atual ganha uma **camada de dados Firebase**. Saem `src/data/seed.ts` (mock) e
`src/state/youthStore.ts` (memória); entram **repositórios** que leem/escrevem no Firestore
com cache offline nativo. As telas continuam as mesmas; só trocam a fonte dos dados (de mock
para repositórios reativos).

```
UI (telas, já prontas)
      │  hooks reativos (onSnapshot)
repositories/  ── youthRepo, groupRepo, auxRepo, attendanceRepo, reportsRepo
      │
services/  ── firebase (init), auth, photos (upload+fila offline), net
      │
@react-native-firebase  ──  Firestore (offline em disco) · Auth · Storage
```

### 3.1 Estrutura de pastas nova
```
src/
  services/
    firebase.ts        # init dos módulos + persistência offline
    auth.ts            # login/logout, username↔email, criar conta sem deslogar admin
    photos.ts          # escolher/comprimir/subir foto + fila offline
    net.ts             # estado online/offline (NetInfo) p/ a fila e o indicador
  data/
    types.ts           # tipos de domínio (migra de seed.ts)
    seedFirestore.ts    # popular dados fictícios + admin inicial (script de dev)
  repositories/
    youthRepo.ts groupRepo.ts auxRepo.ts attendanceRepo.ts reportsRepo.ts
  hooks/
    useAuth.ts         # sessão atual + papel (admin/auxiliar)
```
`src/components`, `src/screens`, `src/theme` permanecem; as telas passam a consumir os
repositórios. `seed.ts` e `youthStore.ts` são removidos ao final da Fase 1.

## 4. Modelo de dados (Firestore)

Single-tenant: sem `congregationId` nos documentos. Timestamps `createdAt`/`updatedAt` via
`serverTimestamp()`.

- **`config/congregation`** (doc único): `{ name: 'Central', ... }` — dados da congregação.
- **`auxiliares/{uid}`** (id = uid do Auth): `name, username, role: 'admin'|'auxiliar',
  phone, birth, baptism, presented, groupIds: string[], status: 'Ativo'|'Inativo',
  photoUrl?, photoPending?, createdAt, updatedAt`.
- **`grupos/{groupId}`**: `name, short, description, auxId, icon: 'baby'|'book'|'users',
  status, createdAt, updatedAt`.
- **`jovens/{youthId}`**: `name, birth, sex, groupId, father, mother, phone, address, notes,
  status, photoUrl?, photoPending?, createdAt, updatedAt`. `age` é **derivado** de `birth`.
- **`reunioes/{meetingId}`**: `date: 'YYYY-MM-DD', groupId, createdBy, createdAt`.
  Id determinístico `${date}_${groupId}` → escrita **idempotente** (seguro pra offline, sem
  reunião duplicada).
- **`reunioes/{meetingId}/presencas/{youthId}`** (subcoleção): `status: 'present'|'absent',
  note?, markedBy, markedAt`. Um registro por jovem/reunião (idempotente).

Relatórios e histórico (Fase 2) são **calculados** a partir de `presencas` (nada de número
fixo). Para a escala de uma congregação, o cálculo é feito no cliente lendo o período/grupo.

## 5. Autenticação e papéis

- **Login**: a pessoa digita "lucas.s"; o app converte para `lucas.s@meucultinho.app` e chama
  `signInWithEmailAndPassword`. A tela de login mantém o campo "Usuário".
- **Admin inicial**: criado por `seedFirestore.ts` (cria o Auth user + doc `auxiliares/{uid}`
  com `role:'admin'`).
- **Admin cria auxiliares dentro do app**: criar usuário no Auth normalmente *desloga* o admin.
  Solução **sem servidor**: instância **secundária** do app Firebase
  (`firebase.initializeApp(config, 'secondary')`), cria o usuário nela e faz `signOut` só da
  secundária; a sessão do admin (instância principal) continua intacta.
- **Papel** (`admin`/`auxiliar`) fica no doc do auxiliar e governa o que cada um vê/faz.
  Aplicação leve na Fase 1 (UI), reforçada por **Security Rules** na Fase 3.

## 6. Offline-first

- Firestore do `@react-native-firebase` já persiste em **disco** por padrão: leituras vêm do
  cache, escritas offline ficam **pendentes** e sincronizam sozinhas ao reconectar — sobrevive
  a fechar/reabrir o app.
- **Fotos** não têm fila offline nativa no Storage. Estratégia: salvar a imagem local
  (`expo-file-system`), gravar `photoPending` no doc e exibir a foto local; `services/net.ts`
  detecta volta da internet e `services/photos.ts` sobe os pendentes, grava `photoUrl` e limpa
  `photoPending`.

## 7. Fotos dos membros

- Captura via **`expo-image-picker`** (câmera ou galeria) + permissões.
- **Compressão/resize** com `expo-image-manipulator` antes do upload (economiza Storage/banda).
- Armazenamento no **Firebase Storage**: `jovens/{youthId}.jpg`, `auxiliares/{uid}.jpg`.
- O componente **`Avatar`** evolui: recebe `photoUrl` opcional → mostra a `Image` quando há
  foto; cai para as **iniciais coloridas** quando não há (comportamento atual preservado).
- Locais: cadastro/detalhe do jovem; tela de **Configurações** (perfil do auxiliar edita a
  própria foto).

## 8. Migração das telas (o que muda em cada uma)

- **Login**: chama `auth.signIn(usuario, senha)`; trata erro (usuário/senha inválidos).
- **Listas (Jovens/Auxiliares/Grupos)**: leem via hooks reativos (`onSnapshot`).
- **Forms (Jovem/Auxiliar/Grupo)**: salvam de verdade (create/update); jovem e auxiliar com foto.
- **Detalhe do Jovem**: lê do banco; excluir remove do Firestore (mantém o diálogo de confirmação).
- **Registrar Frequência**: grava `reuniao` + `presencas`; funciona offline.
- **Histórico / Relatórios** (Fase 2): calculados das presenças.
- **Configurações**: perfil real do usuário logado + foto; "Sair" faz `signOut`; troca de tema
  permanece local.

## 9. Fases

### Fase 1 — Núcleo funcional
Setup do Firebase + dev build; login real (admin e auxiliares); CRUD persistido de
jovens/grupos/auxiliares; registro de frequência persistido e **offline**; fotos (jovem +
perfil) com upload e fila offline; dados fictícios semeados.
**Pronto quando:** dois aparelhos logados veem os mesmos dados; presença marcada offline
sincroniza ao reconectar; foto aparece no avatar; criar auxiliar não desloga o admin.

### Fase 2 — Relatórios reais
Histórico lista reuniões reais (presentes/faltas/percentual). Relatórios (frequência média,
totais, presença por grupo, rankings mais frequentes/ausentes) calculados dos dados; filtros
por período e grupo funcionando.
**Pronto quando:** números batem com os registros e mudam conforme novas presenças.

### Fase 3 — Permissões e extras
Security Rules por papel (auxiliar só mexe nos seus grupos/jovens/frequência; cada um edita o
próprio perfil; admin tudo). Recuperar senha. Indicador de "sincronizando/offline". Exportar/
backup. Abrir WhatsApp do responsável (link `wa.me`).

## 10. Security Rules (esboço)

- Fase 1: usuário autenticado lê/escreve (permissivo, pra destravar o desenvolvimento).
- Fase 3: `auxiliares` e `grupos` só admin escreve; `jovens`/`reunioes`/`presencas` o auxiliar
  escreve nos seus grupos; cada usuário edita seu próprio doc/foto; Storage só autenticado, por
  caminho (`jovens/*`, `auxiliares/{uid}`).

## 11. Testes

- **Firebase Emulator Suite** (Auth + Firestore + Storage) para testes de integração dos
  repositórios sem tocar produção.
- Unidade: mapeamento username↔email; derivação de idade; agregações dos relatórios; lógica da
  fila de fotos.

## 12. Setup que depende de você (pré-requisito da Fase 1)

1. Criar o **projeto no Firebase Console** e um app **Android** com package
   `com.meucultinho.app`; baixar o `google-services.json`.
2. Ativar **Authentication → E-mail/senha**, **Firestore** e **Storage** (este pede o plano
   **Blaze**; uso fica grátis).
3. Conta **Expo/EAS** para gerar o development build.
Eu te guio em cada passo quando chegarmos lá.

## 13. Dependências novas

`@react-native-firebase/app|auth|firestore|storage`, `expo-dev-client`,
`expo-image-picker`, `expo-image-manipulator`, `@react-native-community/netinfo`,
`eas-cli` (dev). Config plugins no `app.json` + `google-services.json`.

## 14. Fora de escopo (YAGNI por enquanto)

Multi-congregação, notificações push, versão web, BI/relatórios avançados, publicação na
Play Store, integração de envio de mensagens (só link do WhatsApp na Fase 3).

## 15. Riscos / pontos de atenção

- Criar conta via instância secundária no `@react-native-firebase` — validar cedo na Fase 1.
- Fila de upload de fotos offline — caminho custom, exige bom teste.
- Storage exige ativar o plano Blaze (cartão), embora sem custo no uso.
- Perde-se o preview no navegador; o teste passa a ser por dev build no Android.
