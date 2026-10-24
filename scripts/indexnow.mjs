/**
 * Avisa os buscadores que usam IndexNow (Bing, Yandex, Seznam, Naver) sobre as páginas públicas publicadas.
 * Rodar depois de cada publicação em produção: npm run seo:indexnow
 * A chave é pública por definição: o arquivo public/<chave>.txt prova que o site é nosso.
 */
const KEY = '1627db4007b64c65def6ef7bcb91aa66';
const SITE = 'https://validaimovel.com';

const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
if (urlList.length === 0) throw new Error('Sitemap vazio ou inacessível.');

const keyFile = await fetch(`${SITE}/${KEY}.txt`);
if (!keyFile.ok || (await keyFile.text()).trim() !== KEY) throw new Error('Arquivo da chave IndexNow não está publicado no site.');

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: 'validaimovel.com', key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: HTTP ${res.status} para ${urlList.length} URLs (200 ou 202 = recebido)`);
