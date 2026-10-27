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

describe('cadastro sem confirmação por e-mail', () => {
  const signup = (body: object, env: object = baseEnv) => call('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://validaimovel.com' },
    body: JSON.stringify(body),
  }, env);
  const created = () => calls.filter(c => c.init.method === 'POST' && c.url.pathname === '/auth/v1/admin/users');

  it('cria a conta já confirmada', async () => {
    mockFetch([[/POST https:\/\/sb\.test\/auth\/v1\/admin\/users/, () => json({ id: USER_ID }, 200)]]);
    const res = await signup({ email: ' Novo@Cliente.com ', password: 'segredo1', name: 'Novo Cliente' });
    expect(res.status).toBe(201);
    expect(JSON.parse(String(created()[0].init.body))).toEqual({
      email: 'novo@cliente.com', password: 'segredo1', email_confirm: true, user_metadata: { full_name: 'Novo Cliente' },
    });
  });

  it('e-mail que já tem conta devolve 409, sem trocar a senha', async () => {
    mockFetch([[/POST https:\/\/sb\.test\/auth\/v1\/admin\/users/, () => json({ msg: 'A user with this email address has already been registered' }, 422)]]);
    const res = await signup({ email: 'existe@cliente.com', password: 'qualquer1' });
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code: 'exists' });
    expect(calls.some(c => c.init.method === 'PUT' || c.init.method === 'PATCH')).toBe(false);
  });

  it('primeiro acesso pela tela de login só vale para e-mails liberados', async () => {
    mockFetch([[/POST https:\/\/sb\.test\/auth\/v1\/admin\/users/, () => json({ id: USER_ID }, 200)]]);
    const env = { ...baseEnv, FIRST_ACCESS_EMAILS: 'liberado@cliente.com, outro@cliente.com' };
    expect((await signup({ email: 'estranho@cliente.com', password: 'qualquer1', firstAccess: true }, env)).status).toBe(403);
    expect(created()).toHaveLength(0);
    expect((await signup({ email: 'LIBERADO@cliente.com', password: 'qualquer1', firstAccess: true }, env)).status).toBe(201);
    expect(created()).toHaveLength(1);
  });

  it('recusa e-mail inválido e senha curta sem chamar o Supabase', async () => {
    mockFetch([]);
    expect((await signup({ email: 'sem-arroba', password: 'segredo1' })).status).toBe(400);
    expect((await signup({ email: 'a@b.com', password: '123' })).status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it('e-mail de administrador não é cadastrado pelo site (nem no primeiro acesso)', async () => {
    mockFetch([]);
    const env = { ...baseEnv, FIRST_ACCESS_EMAILS: 'admin@validaimovel.com' };
    expect((await signup({ email: 'Admin@ValidaImovel.com', password: 'segredo1' })).status).toBe(403);
    expect((await signup({ email: 'admin@validaimovel.com', password: 'segredo1', firstAccess: true }, env)).status).toBe(403);
    expect(calls).toHaveLength(0);
  });
});

describe('cobrança', () => {
  it('cria o Pix com o preço do servidor (R$ 99,90), ignorando o valor enviado pelo navegador', async () => {
    mockFetch([
      [/GET https:\/\/asaas\.test\/v3\/customers\?cpfCnpj=/, () => json({ data: [{ id: 'cus_1' }] })],
      [/POST https:\/\/asaas\.test\/v3\/payments$/, () => json({ id: 'pay_9', status: 'PENDING', value: 99.9, invoiceUrl: 'https://asaas.test/i/9' })],
      [/GET https:\/\/asaas\.test\/v3\/payments\/pay_9\/pixQrCode/, () => json({ encodedImage: 'aW1n', payload: '00020126' })],
    ]);

    const res = await call('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://validaimovel.com' },
      body: JSON.stringify({ name: 'Teste', email: 'teste@x.com', cpf: '123.456.789-09', amount: 1 }),
    });
    expect(await res.json()).toMatchObject({ success: true, amount: 99.9 });
    const charge = calls.find(c => c.init.method === 'POST' && c.url.pathname === '/v3/payments');
    expect(JSON.parse(String(charge?.init.body))).toMatchObject({ value: 99.9, billingType: 'PIX', description: 'ValidaImóvel — Plano Mensal (30 dias)' });
  });
});

describe('webhook do Asaas', () => {
  const payment = (status: string, value = 99.9) => json({
    id: 'pay_1', customer: 'cus_1', status, value, billingType: 'PIX', invoiceUrl: 'https://asaas.test/i/1',
    transactionReceiptUrl: 'https://asaas.test/comprovante/1', externalReference: USER_ID, confirmedDate: '2026-10-24',
  });

  it('recusa chamadas sem o token do Asaas', async () => {
    mockFetch([]);
    const res = await call('/api/webhook/asaas', { method: 'POST', body: '{}' });
    expect(res.status).toBe(401);
    expect(calls).toHaveLength(0);
  });

  it('renovação soma 30 dias aos dias que ainda faltam e grava o comprovante', async () => {
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
    expect(patch.subscription_plan).toBe('Plano Mensal');
    expect(Math.abs(Date.parse(patch.subscription_expires_at) - (expires + 30 * DAY))).toBeLessThan(60_000);

    const record = calls.find(c => c.init.method === 'POST' && c.url.pathname === '/rest/v1/valida_payments');
    expect(JSON.parse(String(record?.init.body))).toMatchObject({ payment_id: 'pay_1', user_id: USER_ID, status: 'pago', receipt_url: 'https://asaas.test/comprovante/1' });
  });

  const firstPayment = (value: number) => mockFetch([
    [/GET https:\/\/asaas\.test\/v3\/payments\/pay_1/, () => payment('RECEIVED', value)],
    [/GET https:\/\/sb\.test\/rest\/v1\/profiles\?id=eq\./, () => json([{
      id: USER_ID, has_subscription: false, subscription_expires_at: new Date(Date.now() - 5 * DAY).toISOString(), payment_id: null,
    }])],
    [/PATCH https:\/\/sb\.test\/rest\/v1\/profiles/, () => json([{ id: USER_ID }])],
    [/POST https:\/\/sb\.test\/rest\/v1\/valida_payments/, () => new Response(null, { status: 201 })],
  ]);

  it('primeiro pagamento (sem plano ativo) dá 30 dias a partir de agora', async () => {
    firstPayment(99.9);
    await webhook('PAYMENT_RECEIVED');
    const [patch] = patches();
    expect(patch.has_subscription).toBe(true);
    expect(Math.abs(Date.parse(patch.subscription_expires_at) - (Date.now() + 30 * DAY))).toBeLessThan(60_000);
  });

  it('Pix de R$ 49,90 gerado antes da mudança de preço e pago depois ainda dá os 90 dias comprados', async () => {
    firstPayment(49.9);
    await webhook('PAYMENT_RECEIVED');
    const [patch] = patches();
    expect(patch).toMatchObject({ has_subscription: true, subscription_plan: 'Plano 3 Meses' });
    expect(Math.abs(Date.parse(patch.subscription_expires_at) - (Date.now() + 90 * DAY))).toBeLessThan(60_000);
  });

  it('cobrança abaixo de qualquer plano não libera acesso', async () => {
    firstPayment(10);
    const res = await webhook('PAYMENT_RECEIVED');
    expect(res.status).toBe(200);
    expect(patches()).toHaveLength(0);
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

  // Cartão: CONFIRMED na aprovação e RECEIVED na liquidação, semanas depois. Se o cliente renovou nesse meio-tempo,
  // o perfil aponta para a cobrança nova e só o histórico mostra que a antiga já foi aplicada.
  const settledAfterRenewal = (history: unknown[]) => mockFetch([
    [/GET https:\/\/asaas\.test\/v3\/payments\/pay_1/, () => payment('RECEIVED')],
    [/GET https:\/\/sb\.test\/rest\/v1\/profiles\?id=eq\./, () => json([{
      id: USER_ID, has_subscription: true, subscription_expires_at: new Date(Date.now() + 40 * DAY).toISOString(), payment_id: 'pay_2',
    }])],
    [/GET https:\/\/sb\.test\/rest\/v1\/valida_payments\?payment_id=eq\.pay_1/, () => json(history)],
    [/PATCH https:\/\/sb\.test\/rest\/v1\/profiles/, () => json([{ id: USER_ID }])],
    [/POST https:\/\/sb\.test\/rest\/v1\/valida_payments/, () => new Response(null, { status: 201 })],
  ]);

  it('cartão: o RECEIVED que chega depois de uma renovação não soma os dias de novo', async () => {
    settledAfterRenewal([{ user_id: USER_ID, status: 'pago' }]);
    const res = await webhook('PAYMENT_RECEIVED');
    expect(res.status).toBe(200);
    expect(patches()).toHaveLength(0);
  });

  it('cobrança paga que ficou sem usuário é aplicada quando o perfil aparece', async () => {
    settledAfterRenewal([{ user_id: null, status: 'pago' }]);
    await webhook('PAYMENT_RECEIVED');
    expect(patches()).toHaveLength(1);
  });

  const refund = (value: number, daysLeft: number) => mockFetch([
    [/GET https:\/\/asaas\.test\/v3\/payments\/pay_1/, () => payment('REFUNDED', value)],
    [/GET https:\/\/sb\.test\/rest\/v1\/profiles\?payment_id=eq\.pay_1/, () => json([{
      id: USER_ID, has_subscription: true, subscription_expires_at: new Date(Date.now() + daysLeft * DAY).toISOString(), payment_id: 'pay_1',
    }])],
    [/PATCH https:\/\/sb\.test\/rest\/v1\/profiles/, () => json([{ id: USER_ID }])],
    [/GET https:\/\/asaas\.test\/v3\/customers\/cus_1/, () => json({ email: 'cliente@x.com' })],
    [/POST https:\/\/sb\.test\/rest\/v1\/valida_payments/, () => new Response(null, { status: 201 })],
  ]);

  it('estorno retira os 30 dias da cobrança e mantém o acesso se ainda sobrar prazo', async () => {
    refund(99.9, 40);
    await webhook('PAYMENT_REFUNDED');
    const [patch] = patches();
    expect(patch.has_subscription).toBe(true);
    expect(patch.payment_id).toBe('pay_1:estornado');
    expect(Math.abs(Date.parse(patch.subscription_expires_at) - (Date.now() + 10 * DAY))).toBeLessThan(60_000);
  });

  it('estorno de uma cobrança antiga de R$ 49,90 retira os 90 dias que ela deu', async () => {
    refund(49.9, 100);
    await webhook('PAYMENT_REFUNDED');
    const [patch] = patches();
    expect(patch.has_subscription).toBe(true);
    expect(Math.abs(Date.parse(patch.subscription_expires_at) - (Date.now() + 10 * DAY))).toBeLessThan(60_000);
  });

  it('chargeback encerra o acesso quando não sobra prazo', async () => {
    mockFetch([
      [/GET https:\/\/asaas\.test\/v3\/payments\/pay_1/, () => payment('CHARGEBACK_REQUESTED')],
      [/GET https:\/\/sb\.test\/rest\/v1\/profiles\?payment_id=eq\.pay_1/, () => json([{
        id: USER_ID, has_subscription: true, subscription_expires_at: new Date(Date.now() + 20 * DAY).toISOString(), payment_id: 'pay_1',
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
