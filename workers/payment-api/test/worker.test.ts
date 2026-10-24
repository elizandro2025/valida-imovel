import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../src/index';
import { buildOcrRequestParts, buildTaskRequest } from '../src/prompts';

const DAY = 24 * 60 * 60 * 1000;
const USER_ID = '6f1c2b3a-1111-4222-8333-944455556666';

type Handler = (url: URL, init: RequestInit) => Response | Promise<Response>;
interface Call { url: URL; init: RequestInit }

let calls: Call[] = [];
const realFetch = globalThis.fetch;

function mockFetch(routes: Array<[RegExp, Handler]>) {
  calls = [];
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    calls.push({ url, init });
    for (const [re, handler] of routes) {
      if (re.test(`${init.method || 'GET'} ${url.href}`)) return handler(url, init);
    }
    return new Response(`sem mock para ${init.method || 'GET'} ${url.href}`, { status: 599 });
  }) as typeof fetch;
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

const allow = { limit: async () => ({ success: true }) };
const baseEnv = {
  ASAAS_API_URL: 'https://asaas.test/v3',
  ASAAS_API_KEY: 'asaas-key',
  ASAAS_WEBHOOK_TOKEN: 'webhook-token',
  SUPABASE_URL: 'https://sb.test',
  SUPABASE_SERVICE_KEY: 'service-key',
  GEMINI_API_KEY: 'gemini-key',
  ADMIN_EMAILS: 'admin@validaimovel.com',
  ENVIRONMENT: 'production',
  AI_LIMITER: allow,
  PAYMENT_LIMITER: allow,
  ERROR_LIMITER: allow,
};
const sandboxEnv = { ...baseEnv, ENVIRONMENT: 'sandbox', SELFTEST_TOKEN: 'token-de-teste-123' };
const waits: Promise<unknown>[] = [];
const ctx = { waitUntil: (p: Promise<unknown>) => { waits.push(p); }, passThroughOnException: () => undefined } as unknown as ExecutionContext;

const call = (path: string, init: RequestInit = {}, env: object = baseEnv) =>
  worker.fetch(new Request(`https://api.validaimovel.com${path}`, init), env as never, ctx);

const webhook = (event: string, paymentId = 'pay_1') => call('/api/webhook/asaas', {
  method: 'POST',
  headers: { 'asaas-access-token': 'webhook-token', 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 'evt_1', event, payment: { id: paymentId } }),
});

const patches = () => calls.filter(c => c.init.method === 'PATCH' && c.url.pathname === '/rest/v1/profiles')
  .map(c => JSON.parse(String(c.init.body)));

beforeEach(() => { waits.length = 0; });
afterEach(() => { globalThis.fetch = realFetch; });

describe('webhook do Asaas', () => {
  const payment = (status: string) => json({
    id: 'pay_1', customer: 'cus_1', status, value: 49.9, billingType: 'PIX', invoiceUrl: 'https://asaas.test/i/1',
    transactionReceiptUrl: 'https://asaas.test/comprovante/1', externalReference: USER_ID, confirmedDate: '2026-10-24',
  });

  it('recusa chamadas sem o token do Asaas', async () => {
    mockFetch([]);
    const res = await call('/api/webhook/asaas', { method: 'POST', body: '{}' });
    expect(res.status).toBe(401);
    expect(calls).toHaveLength(0);
  });

  it('renovação soma 90 dias aos dias que ainda faltam e grava o comprovante', async () => {
    const expires = Date.now() + 10 * DAY;
    mockFetch([
      [/GET https:\/\/asaas\.test\/v3\/payments\/pay_1/, () => payment('CONFIRMED')],
      [/GET https:\/\/sb\.test\/rest\/v1\/profiles\?id=eq\./, () => json([{
        id: USER_ID, has_subscription: true, subscription_status: 'active', subscription_expires_at: new Date(expires).toISOString(), payment_id: 'pay_0',
      }])],
      [/PATCH https:\/\/sb\.test\/rest\/v1\/profiles/, () => json([{ id: USER_ID }])],
      [/POST https:\/\/sb\.test\/rest\/v1\/valida_payments/, () => new Response(null, { status: 201 })],
    ]);

    const res = await webhook('PAYMENT_CONFIRMED');
    expect(res.status).toBe(200);
    const [patch] = patches();
    expect(patch.payment_id).toBe('pay_1');
    expect(Math.abs(Date.parse(patch.subscription_expires_at) - (expires + 90 * DAY))).toBeLessThan(60_000);

    const record = calls.find(c => c.url.pathname === '/rest/v1/valida_payments');
    expect(JSON.parse(String(record?.init.body))).toMatchObject({ payment_id: 'pay_1', user_id: USER_ID, status: 'pago', receipt_url: 'https://asaas.test/comprovante/1' });
  });

  it('primeiro pagamento (sem plano ativo) dá 90 dias a partir de agora', async () => {
    mockFetch([
      [/GET https:\/\/asaas\.test\/v3\/payments\/pay_1/, () => payment('RECEIVED')],
      [/GET https:\/\/sb\.test\/rest\/v1\/profiles\?id=eq\./, () => json([{
        id: USER_ID, has_subscription: false, subscription_expires_at: new Date(Date.now() - 5 * DAY).toISOString(), payment_id: null,
      }])],
      [/PATCH https:\/\/sb\.test\/rest\/v1\/profiles/, () => json([{ id: USER_ID }])],
      [/POST https:\/\/sb\.test\/rest\/v1\/valida_payments/, () => new Response(null, { status: 201 })],
    ]);

    await webhook('PAYMENT_RECEIVED');
    const [patch] = patches();
    expect(patch.has_subscription).toBe(true);
    expect(Math.abs(Date.parse(patch.subscription_expires_at) - (Date.now() + 90 * DAY))).toBeLessThan(60_000);
  });

  it('evento repetido da mesma cobrança não soma dias de novo', async () => {
    mockFetch([
      [/GET https:\/\/asaas\.test\/v3\/payments\/pay_1/, () => payment('RECEIVED')],
      [/GET https:\/\/sb\.test\/rest\/v1\/profiles\?id=eq\./, () => json([{
        id: USER_ID, has_subscription: true, subscription_expires_at: new Date(Date.now() + 90 * DAY).toISOString(), payment_id: 'pay_1',
      }])],
      [/POST https:\/\/sb\.test\/rest\/v1\/valida_payments/, () => new Response(null, { status: 201 })],
    ]);

    const res = await webhook('PAYMENT_RECEIVED');
    expect(res.status).toBe(200);
    expect(patches()).toHaveLength(0);
  });

  it('estorno retira os 90 dias da cobrança e mantém o acesso se ainda sobrar prazo', async () => {
    mockFetch([
      [/GET https:\/\/asaas\.test\/v3\/payments\/pay_1/, () => payment('REFUNDED')],
      [/GET https:\/\/sb\.test\/rest\/v1\/profiles\?payment_id=eq\.pay_1/, () => json([{
        id: USER_ID, has_subscription: true, subscription_expires_at: new Date(Date.now() + 100 * DAY).toISOString(), payment_id: 'pay_1',
      }])],
      [/PATCH https:\/\/sb\.test\/rest\/v1\/profiles/, () => json([{ id: USER_ID }])],
      [/GET https:\/\/asaas\.test\/v3\/customers\/cus_1/, () => json({ email: 'cliente@x.com' })],
      [/POST https:\/\/sb\.test\/rest\/v1\/valida_payments/, () => new Response(null, { status: 201 })],
    ]);

    await webhook('PAYMENT_REFUNDED');
    const [patch] = patches();
    expect(patch.has_subscription).toBe(true);
    expect(patch.payment_id).toBe('pay_1:estornado');
    expect(Math.abs(Date.parse(patch.subscription_expires_at) - (Date.now() + 10 * DAY))).toBeLessThan(60_000);
  });

  it('chargeback encerra o acesso quando não sobra prazo', async () => {
    mockFetch([
      [/GET https:\/\/asaas\.test\/v3\/payments\/pay_1/, () => payment('CHARGEBACK_REQUESTED')],
      [/GET https:\/\/sb\.test\/rest\/v1\/profiles\?payment_id=eq\.pay_1/, () => json([{
        id: USER_ID, has_subscription: true, subscription_expires_at: new Date(Date.now() + 30 * DAY).toISOString(), payment_id: 'pay_1',
      }])],
      [/PATCH https:\/\/sb\.test\/rest\/v1\/profiles/, () => json([{ id: USER_ID }])],
      [/POST https:\/\/sb\.test\/rest\/v1\/valida_payments/, () => new Response(null, { status: 201 })],
    ]);

    await webhook('PAYMENT_CHARGEBACK_REQUESTED');
    const [patch] = patches();
    expect(patch).toMatchObject({ has_subscription: false, subscription_status: 'chargeback' });
  });
});

describe('IA', () => {
  const geminiOk = (text: string) => json({ candidates: [{ content: { parts: [{ text }] }, finishReason: 'STOP' }] });
  const selftest = { 'X-Selftest-Token': 'token-de-teste-123' };

  it('etapa de análise usa o prompt do servidor e troca de modelo quando o primeiro está sobrecarregado', async () => {
    mockFetch([
      [/gemini-flash-latest:generateContent/, () => new Response('{}', { status: 503 })],
      [/gemini-3\.5-flash:generateContent/, () => geminiOk('{"parecer_analise":{"score_risco":10}}')],
    ]);
    const text = 'MATRÍCULA 1234 — R-1 compra e venda '.repeat(5);
    const res = await call('/api/ai/task', { method: 'POST', headers: selftest, body: JSON.stringify({ task: 'parecer', text }) }, sandboxEnv);

    expect(res.status).toBe(200);
    expect(res.headers.get('X-AI-Model')).toBe('gemini-3.5-flash');
    expect(res.headers.get('Access-Control-Expose-Headers')).toContain('X-AI-Model');
    const sent = JSON.parse(String(calls[1].init.body));
    expect(sent.contents[0].parts[0].text).toContain('parecer_analise');
    expect(sent.contents[0].parts[0].text).toContain(text.trim());
    expect(sent.generationConfig.responseMimeType).toBe('application/json');
  });

  it('o token de autoteste não vale fora do sandbox', async () => {
    mockFetch([]);
    const res = await call('/api/ai/task', { method: 'POST', headers: selftest, body: '{}' }, { ...sandboxEnv, ENVIRONMENT: 'production' });
    expect(res.status).toBe(401);
  });

  it('recusa etapa desconhecida (a rota não é mais um repasse genérico ao Gemini)', async () => {
    mockFetch([]);
    const res = await call('/api/ai/task', { method: 'POST', headers: selftest, body: JSON.stringify({ task: 'qualquer', text: 'x'.repeat(100) }) }, sandboxEnv);
    expect(res.status).toBe(400);
    expect(await call('/api/ai/generate', { method: 'POST', body: '{}' })).toHaveProperty('status', 404);
  });

  it('OCR aceita só PDF em base64 e monta um JSON válido em volta do arquivo', async () => {
    mockFetch([[/generateContent/, () => geminiOk('--- Página 1 ---\nTexto')]]);
    const pdf = 'JVBERi0xLjQK' + 'A'.repeat(200);

    expect((await call('/api/ai/ocr', { method: 'POST', headers: selftest, body: 'isto não é um pdf'.repeat(10) }, sandboxEnv)).status).toBe(400);
    expect((await call('/api/ai/ocr', { method: 'POST', headers: selftest, body: `${pdf}"}],"x":"` }, sandboxEnv)).status).toBe(400);

    const res = await call('/api/ai/ocr', { method: 'POST', headers: selftest, body: pdf }, sandboxEnv);
    expect(res.status).toBe(200);
    const sentBody = calls[calls.length - 1].init.body as Blob;
    const sent = JSON.parse(await sentBody.text());
    expect(sent.contents[0].parts[0].inline_data).toEqual({ mime_type: 'application/pdf', data: pdf });
  });

  it('aplica o limite diário de uso justo', async () => {
    mockFetch([
      [/\/auth\/v1\/user/, () => json({ id: USER_ID, email: 'cliente@x.com' })],
      [/\/rest\/v1\/profiles\?id=eq\./, () => json([{ has_subscription: true, subscription_expires_at: new Date(Date.now() + DAY).toISOString() }])],
      [/\/rest\/v1\/valida_ai_usage/, () => new Response('[]', { status: 206, headers: { 'content-range': '0-0/30' } })],
    ]);
    const res = await call('/api/ai/ocr', { method: 'POST', headers: { Authorization: 'Bearer token' }, body: 'JVBERi0' + 'A'.repeat(200) });
    expect(res.status).toBe(429);
    expect((await res.json() as { error: string }).error).toMatch(/30 análises por dia/);
  });

  it('sem a tabela de uso (migração pendente), não bloqueia o cliente', async () => {
    mockFetch([
      [/\/auth\/v1\/user/, () => json({ id: USER_ID, email: 'cliente@x.com' })],
      [/\/rest\/v1\/profiles\?id=eq\./, () => json([{ has_subscription: true, subscription_expires_at: new Date(Date.now() + DAY).toISOString() }])],
      [/GET https:\/\/sb\.test\/rest\/v1\/valida_ai_usage/, () => json({ message: 'relation does not exist' }, 404)],
      [/POST https:\/\/sb\.test\/rest\/v1\/valida_ai_usage/, () => json({}, 404)],
      [/generateContent/, () => geminiOk('texto lido')],
    ]);
    const res = await call('/api/ai/ocr', { method: 'POST', headers: { Authorization: 'Bearer token' }, body: 'JVBERi0' + 'A'.repeat(200) });
    expect(res.status).toBe(200);
  });

  it('assinatura vencida recebe 402', async () => {
    mockFetch([
      [/\/auth\/v1\/user/, () => json({ id: USER_ID, email: 'cliente@x.com' })],
      [/\/rest\/v1\/profiles\?id=eq\./, () => json([{ has_subscription: true, subscription_expires_at: new Date(Date.now() - DAY).toISOString() }])],
    ]);
    const res = await call('/api/ai/chat', { method: 'POST', headers: { Authorization: 'Bearer token' }, body: '{}' });
    expect(res.status).toBe(402);
  });
});

describe('prompts', () => {
  it('não trazem valores de exemplo que induzam a resposta', () => {
    const prompt = buildTaskRequest('parecer', 'documento').contents[0].parts[0].text;
    expect(prompt).not.toMatch(/"score_risco":\s*\d/);
    expect(prompt).not.toMatch(/"sem_penhora_ativa":\s*true/);
    const extraction = buildTaskRequest('extracao', 'documento').contents[0].parts[0].text;
    for (const key of ['onus_garantias_financeiras', 'averbacoes_diversas', 'embargos_ambientais', 'ato_cancelamento', 'trecho_origem']) {
      expect(extraction).toContain(key);
    }
  });

  it('o pedido de OCR é um JSON válido com qualquer base64', () => {
    const { prefix, suffix } = buildOcrRequestParts();
    expect(() => JSON.parse(`${prefix}JVBERi0+/=${suffix}`)).not.toThrow();
  });
});
