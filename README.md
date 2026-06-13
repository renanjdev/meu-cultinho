# Meu Cultinho

Aplicativo Android para auxiliares e administradores de igreja controlarem a
frequência de crianças, adolescentes e jovens nos cultos e reuniões.

Implementado em **React Native (Expo + TypeScript)** a partir do protótipo de
design exportado do Claude Design. Esta etapa é **somente front-end**: dados
fictícios, sem backend, banco de dados ou autenticação real.

## Como rodar (web app)

Este é um **web app** (react-native-web/Expo) — acessado pelo navegador no
celular (Android/iPhone) ou no desktop. As dependências já estão instaladas.

Desenvolvimento:

```bash
npm run web          # expo start --web (Metro) → http://localhost:8081
```

Build de produção (estático) para deploy na Vercel/Netlify/etc.:

```bash
npx expo export -p web   # gera a pasta dist/
```

> **Backend (Fase 1, adiada):** login real, Firestore, fotos e fila offline
> estão esboçados em `src/services/`, `src/repositories/`, `src/hooks/useAuth.ts`
> e `src/data/seedFirestore.ts`. Esses módulos usam `@react-native-firebase`
> (nativo, **não roda no navegador**) e por isso ficam **fora do caminho de
> execução** do web app — o protótipo navega por papel (Admin/Auxiliar) com
> dados mock. Para reativar o backend no web, migrar para o **Firebase JS SDK**
> (pacote `firebase`).

## Estrutura

```
App.tsx                 raiz: carrega fontes, providers e o navegador
src/
  theme/
    tokens.ts           tokens da identidade visual (Aconchego) como objeto
    ThemeProvider.tsx   contexto de tema + papel (admin/auxiliar)
  data/seed.ts          dados fictícios (grupos, jovens, auxiliares, histórico)
  state/youthStore.ts   store reativo (cadastrar / excluir jovem)
  navigation/           mapa de rotas + hook go()/back()
  components/
    Icons.tsx           ícones em react-native-svg
    ui.tsx              biblioteca de componentes (cards, chips, campos, etc.)
  screens/              as 15 telas
```

## Telas

Splash · Login · Home Admin · Home Auxiliar · Lista de Jovens · Cadastro de
Jovem · Detalhes do Jovem · Auxiliares · Cadastro de Auxiliar · Grupos ·
Cadastro de Grupo · **Registrar Frequência** · Histórico · Relatórios ·
Configurações.

## Identidade visual

Identidade única **Aconchego** — índigo acolhedor (#5b6ce0), cantos bem
arredondados e fonte **Fredoka**. Verde suave = presente, vermelho suave =
falta, dourado = destaque/pendente; fundo cinza muito claro, texto cinza-escuro.

## O que funciona de verdade no protótipo

- Navegação completa entre as 15 telas, com fluxo distinto para Admin e Auxiliar
- Cadastrar e excluir jovem (a lista atualiza na hora)
- Registrar frequência: cada card fica verde (presente) ou vermelho (falta)

Datas, relatórios e gráficos são representações visuais com dados fictícios.
