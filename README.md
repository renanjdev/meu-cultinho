# Meu Cultinho

Aplicativo Android para auxiliares e administradores de igreja controlarem a
frequência de crianças, adolescentes e jovens nos cultos e reuniões.

Implementado em **React Native (Expo + TypeScript)** a partir do protótipo de
design exportado do Claude Design. Esta etapa é **somente front-end**: dados
fictícios, sem backend, banco de dados ou autenticação real.

## Como rodar

As dependências já estão instaladas. Para abrir no seu celular Android:

```bash
npx expo start
```

Leia o QR Code com o app **Expo Go** (Play Store). Ou, com um emulador Android
aberto:

```bash
npm run android
```

Para gerar um APK/AAB instalável, use o EAS Build:

```bash
npx eas build -p android
```

## Estrutura

```
App.tsx                 raiz: carrega fontes, providers e o navegador
src/
  theme/
    tokens.ts           os 3 temas (Sereno / Jardim / Aconchego) como objetos
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

Três temas trocáveis ao vivo em **Configurações → Identidade visual**:

- **Sereno** — azul suave (padrão), fonte Nunito
- **Jardim** — verde-água + dourado, fonte Quicksand
- **Aconchego** — índigo acolhedor, fonte Fredoka

## O que funciona de verdade no protótipo

- Navegação completa entre as 15 telas, com fluxo distinto para Admin e Auxiliar
- Cadastrar e excluir jovem (a lista atualiza na hora)
- Registrar frequência: cada card fica verde (presente) ou vermelho (falta)
- Troca de tema em tempo real

Datas, relatórios e gráficos são representações visuais com dados fictícios.
