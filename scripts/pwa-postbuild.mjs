/**
 * Pós-build do PWA. O export web do Expo (Metro) não gera manifest/meta tags,
 * então aqui: (1) garantimos que os arquivos de `public/` estejam em `dist/` e
 * (2) injetamos as tags de PWA no <head> do dist/index.html (idempotente).
 * Rodado depois de `expo export -p web` (ver vercel.json).
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const pub = join(root, 'public');

function copyDir(src, dst) {
  if (!existsSync(src)) return;
  mkdirSync(dst, { recursive: true });
  for (const name of readdirSync(src)) {
    const s = join(src, name);
    const d = join(dst, name);
    if (statSync(s).isDirectory()) copyDir(s, d);
    else copyFileSync(s, d);
  }
}

// 1) garante assets de public/ dentro de dist/ (o Expo normalmente já copia)
copyDir(pub, dist);

// 2) injeta as tags de PWA no <head>
const htmlPath = join(dist, 'index.html');
if (!existsSync(htmlPath)) {
  console.error('[pwa] dist/index.html não encontrado — rode `expo export -p web` antes.');
  process.exit(1);
}

let html = readFileSync(htmlPath, 'utf8');

// 2a) idioma pt-BR no <html> — evita o prompt de tradução do navegador
if (/<html lang="[^"]*">/.test(html)) {
  html = html.replace(/<html lang="[^"]*">/, '<html lang="pt-BR">');
} else {
  html = html.replace('<html>', '<html lang="pt-BR">');
}

// 2b) tags de PWA no <head> (idempotente)
const MARKER = '<!-- pwa:meu-cultinho -->';
if (html.includes(MARKER)) {
  console.log('[pwa] tags já presentes — apenas idioma ajustado.');
} else {
  const tags = `    ${MARKER}
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="theme-color" content="#5b6ce0" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Meu Cultinho" />
    <link rel="apple-touch-icon" href="/icons/icon.png" />
    <script src="/sw-register.js" defer></script>
`;
  html = html.replace('</head>', `${tags}  </head>`);
  console.log('[pwa] tags de PWA injetadas em dist/index.html');
}

writeFileSync(htmlPath, html);
