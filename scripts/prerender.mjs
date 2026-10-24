/**
 * Pré-renderização das páginas públicas (roda depois do `vite build`).
 *
 * Por quê: o site é montado no navegador; buscadores tradicionais até executam JavaScript, mas assistentes de IA
 * (ChatGPT, Perplexity, Claude) e a maioria dos robôs leem só o HTML. Aqui cada página pública é aberta num Chrome
 * headless e o HTML final é salvo em dist/ — com título, descrição, canonical, dados estruturados e o texto completo.
 *
 * Saídas:
 *   dist/index.html, dist/guia.html, dist/guia/<slug>.html, dist/termos.html, dist/privacidade.html
 *   dist/spa.html e dist/404.html  — o "esqueleto" do app para as telas logadas (ver public/_redirects)
 *   dist/sitemap.xml, dist/llms.txt, dist/llms-full.txt
 *
 * Requer Chrome/Chromium (CHROME_PATH ou caminhos padrão). SKIP_PRERENDER=1 pula a etapa (não usar em produção).
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const DIST = path.resolve('dist');
const SITE = 'https://validaimovel.com';
const START_ROUTES = ['/', '/guia', '/termos', '/privacidade'];
const PUBLIC_ROUTE = /^\/(?:guia(?:\/[a-z0-9-]+)?|termos|privacidade)?$/;

if (process.env.SKIP_PRERENDER) {
  console.warn('⚠️  Pré-renderização pulada (SKIP_PRERENDER). Não publique este build em produção.');
  process.exit(0);
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  return candidates.find(p => fs.existsSync(p));
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── 1. Esqueleto do app (antes de qualquer página ser sobrescrita) ───────────
const shell = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
fs.writeFileSync(path.join(DIST, 'spa.html'), shell);
// Telas logadas e rotas inexistentes não devem ser indexadas (o servidor local usa spa.html sem esta troca)
const appShell = shell.replace(/<meta name="robots" content="[^"]*"\s*\/?>/, '<meta name="robots" content="noindex, nofollow" />');
if (appShell === shell) throw new Error('index.html sem <meta name="robots">: não foi possível marcar o esqueleto do app como noindex.');

// ─── 2. Servidor estático local (sem o HTML pré-renderizado, que só é gravado no fim) ──
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml', '.map': 'application/json' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname);
  let file = path.join(DIST, pathname);
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'spa.html');
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

// ─── 3. Chrome headless via DevTools Protocol ─────────────────────────────────
const chromePath = findChrome();
if (!chromePath) {
  server.close();
  throw new Error('Chrome não encontrado para pré-renderizar. Defina CHROME_PATH (ou SKIP_PRERENDER=1 só para testes locais).');
}
const debugPort = 9300 + Math.floor(Math.random() * 500);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'prerender-'));
const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
  `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, '--window-size=1280,900',
  ...(process.env.CI ? ['--no-sandbox'] : []), 'about:blank',
], { stdio: 'ignore' });

let target;
for (let i = 0; i < 80 && !target; i++) {
  try { target = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' })).json(); } catch { await sleep(250); }
}
if (!target) throw new Error('Não foi possível conectar ao Chrome.');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
let seq = 0;
const pending = new Map();
const errors = [];
ws.addEventListener('message', ev => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
});
const send = (method, params = {}) => new Promise(r => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async expression => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
await send('Runtime.enable');
await send('Page.enable');

// ─── 4. Renderiza e segue os links internos públicos ──────────────────────────
const pages = new Map();
const queue = [...START_ROUTES];
while (queue.length > 0) {
  const route = queue.shift();
  if (pages.has(route)) continue;
  errors.length = 0;
  await send('Page.navigate', { url: `${ORIGIN}${route}` });

  let ready = false;
  for (let i = 0; i < 60 && !ready; i++) {
    await sleep(150);
    ready = await evaluate(`Boolean(document.querySelector('main') && document.querySelector('h1') && !document.querySelector('[aria-label="Carregando"]'))`);
  }
  if (!ready) throw new Error(`A página ${route} não terminou de renderizar. Erros: ${errors.join(' | ')}`);
  await sleep(250);

  const data = await evaluate(`(() => ({
    html: '<!DOCTYPE html>\\n' + document.documentElement.outerHTML,
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || '',
    canonical: document.querySelector('link[rel="canonical"]')?.href || '',
    robots: document.querySelector('meta[name="robots"]')?.content || '',
    text: document.querySelector('main')?.innerText || '',
    links: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
  }))()`);

  if (errors.length > 0) throw new Error(`Erro de JavaScript em ${route}: ${errors.join(' | ')}`);
  if (/noindex/.test(data.robots)) throw new Error(`A página pública ${route} saiu com noindex.`);
  if (data.canonical !== `${SITE}${route === '/' ? '/' : route}`) throw new Error(`Canonical errado em ${route}: ${data.canonical}`);

  pages.set(route, data);
  for (const href of data.links) {
    if (!href.startsWith('/')) continue;
    const clean = href.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
    if (PUBLIC_ROUTE.test(clean) && !pages.has(clean) && !queue.includes(clean)) queue.push(clean);
  }
  console.log(`✓ ${route}  —  ${data.title}`);
}

ws.close();
chrome.kill();
server.close();
try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* perfil temporário em uso no Windows: ignora */ }

// ─── 5. Grava o HTML pronto de cada página ────────────────────────────────────
fs.writeFileSync(path.join(DIST, 'spa.html'), appShell);
fs.writeFileSync(path.join(DIST, '404.html'), appShell);
const htmlFile = route => (route === '/' ? 'index.html' : `${route.slice(1)}.html`);
for (const [route, data] of pages) {
  const file = path.join(DIST, htmlFile(route));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data.html.replaceAll(ORIGIN, SITE));
}

// ─── 6. Sitemap ───────────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const priority = route => (route === '/' ? '1.0' : route.startsWith('/guia') ? '0.8' : '0.3');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...pages.keys()].map(route => `  <url>
    <loc>${SITE}${route === '/' ? '/' : route}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority(route)}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);

// ─── 7. llms.txt e llms-full.txt (resumo e texto completo para assistentes de IA) ──
// Fatos do produto: manter igual a src/config/companyConfig.ts e workers/payment-api (PLAN, DAILY_LIMITS)
const facts = [
  'Preço: R$ 49,90, pagamento único (Pix ou cartão), 3 meses de acesso, sem renovação automática; 7 dias para desistir com reembolso.',
  'Uso justo: até 30 análises por dia por conta, sem cobrança por documento.',
  'Aceita: certidão de matrícula em PDF de qualquer cartório do Brasil, digital ou escaneada, com até 15 MB.',
  'Tempo: em geral de 1 a 4 minutos por análise.',
  'Entrega: proprietários atuais, cadeia dominial, hipotecas, alienação fiduciária, penhoras e indisponibilidades (ativas, canceladas ou a conferir), nota de risco de 0 a 100, trecho da matrícula que embasa cada risco, relatório em PDF e histórico na conta.',
  'Limites: análise automatizada por IA a partir do PDF enviado; não consulta cartórios em tempo real, não emite certidões e não substitui a certidão atualizada nem a orientação de um advogado.',
  `Exemplos gratuitos, sem cadastro: ${SITE}/app?sample=safe e ${SITE}/app?sample=risk`,
];
const home = pages.get('/');
const guides = [...pages.entries()].filter(([route]) => route.startsWith('/guia/'));
const others = [...pages.entries()].filter(([route]) => !route.startsWith('/guia/') && route !== '/');
const bullet = ([route, data]) => `- [${data.title.replace(/ \| ValidaImóvel$/, '')}](${SITE}${route}): ${data.description}`;
const llms = `# ValidaImóvel

> ${home.description}

O ValidaImóvel é um serviço brasileiro de análise de matrícula de imóvel com inteligência artificial, voltado a compradores, corretores, advogados, investidores e profissionais de regularização.

## Fatos principais

${facts.map(f => `- ${f}`).join('\n')}

## Guias

${guides.map(bullet).join('\n')}

## Outras páginas

- [Início](${SITE}/): ${home.description}
${others.map(bullet).join('\n')}

## Texto completo

- [llms-full.txt](${SITE}/llms-full.txt): conteúdo integral das páginas públicas, em texto
`;
fs.writeFileSync(path.join(DIST, 'llms.txt'), llms);

const full = [...pages.entries()].map(([route, data]) =>
  `# ${data.title}\nURL: ${SITE}${route === '/' ? '/' : route}\n\n${data.text.replace(/\n{3,}/g, '\n\n').trim()}\n`).join('\n---\n\n');
fs.writeFileSync(path.join(DIST, 'llms-full.txt'), `# ValidaImóvel — conteúdo das páginas públicas\n\n${facts.map(f => `- ${f}`).join('\n')}\n\n---\n\n${full}`);

console.log(`\nPré-renderizadas ${pages.size} páginas; sitemap.xml, llms.txt e llms-full.txt gerados.`);
process.exit(0);
