/**
 * Cloudflare Worker — ValidaImovel API (pagamentos Asaas, IA Gemini e admin)
 *
 * Rotas:
 *   POST /api/create-payment      — Cria cobrança Pix no Asaas e devolve o QR Code
 *   POST /api/create-preference   — Cria cobrança no cartão e devolve o link da fatura Asaas
 *   GET  /api/payment-status/:id  — Consulta status de uma cobrança
 *   POST /api/webhook/asaas       — Recebe eventos do Asaas e ativa a assinatura no Supabase
 *   POST /api/ai/generate         — Repassa ao Gemini (exige login + assinatura ativa)
 *   GET  /api/admin/users         — Lista usuários (somente admin)
 *   POST /api/admin/subscription  — Libera ou revoga assinatura (somente admin)
 *
 * Cron diário: consulta o Supabase para o projeto gratuito não ser pausado por inatividade.
 */

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  ASAAS_API_URL: string; // https://api.asaas.com/v3 (produção) ou https://api-sandbox.asaas.com/v3
  ASAAS_API_KEY: string;
  ASAAS_WEBHOOK_TOKEN: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  GEMINI_API_KEY: string;
  ADMIN_EMAILS: string; // e-mails separados por vírgula
  ENVIRONMENT: string;
  AI_LIMITER: RateLimiter;
  PAYMENT_LIMITER: RateLimiter;
}

// Preço e duração definidos no servidor — qualquer valor enviado pelo navegador é ignorado
const PLAN = {
  value: 49.9,
  days: 90,
  name: 'Plano 3 Meses Ilimitado',
  description: 'ValidaImóvel — Plano 3 Meses Ilimitado',
};

// Para onde o Asaas devolve o cliente após pagar no cartão (domínio precisa estar cadastrado na conta Asaas)
const SUCCESS_URL = 'https://validaimovel.com/app';

const PAID_STATUSES = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface AsaasPayment {
  id: string;
  customer: string;
  status: string;
  value: number;
  invoiceUrl: string;
  externalReference?: string | null;
  confirmedDate?: string | null;
  paymentDate?: string | null;
}

// ─── CORS ────────────────────────────────────────────────────────────────────
// Só o site (e as prévias do Cloudflare Pages) pode chamar a API pelo navegador
const ALLOWED_ORIGINS = ['https://validaimovel.com', 'https://www.validaimovel.com', 'http://localhost:8080'];
const PREVIEW_ORIGIN_RE = /^https:\/\/([a-z0-9-]+\.)?validaimovel-680\.pages\.dev$/;

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) || PREVIEW_ORIGIN_RE.test(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function jsonResponse(body: string | object, status = 200) {
  const content = typeof body === 'string' ? body : JSON.stringify(body);
  return new Response(content, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── Asaas API Helper ─────────────────────────────────────────────────────────
class AsaasError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function asaasRequest<T>(env: Env, path: string, method = 'GET', body?: object): Promise<T> {
  const response = await fetch(`${env.ASAAS_API_URL}${path}`, {
    method,
    headers: {
      'access_token': env.ASAAS_API_KEY,
      'Content-Type': 'application/json',
      'User-Agent': 'ValidaImovel-Payment-API',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({})) as { errors?: Array<{ description?: string }> };
  if (!response.ok) {
    const message = data.errors?.map(e => e.description).filter(Boolean).join('; ') || `HTTP ${response.status}`;
    throw new AsaasError(message, response.status);
  }
  return data as T;
}

// ─── Dados do pagador ─────────────────────────────────────────────────────────
interface Payer {
  name: string;
  email: string;
  cpf: string;
  userId: string | null;
}

async function readPayer(request: Request): Promise<Payer | string> {
  let body: { name?: string; email?: string; cpf?: string; userId?: string };
  try {
    body = await request.json();
  } catch {
    return 'JSON inválido no corpo da requisição';
  }

  const email = (body.email || '').trim().toLowerCase();
  const cpf = (body.cpf || '').replace(/\D/g, '');
  if (!email.includes('@')) return 'Informe um e-mail válido.';
  if (cpf.length !== 11 && cpf.length !== 14) return 'Informe um CPF (ou CNPJ) válido.';

  return {
    email,
    cpf,
    name: (body.name || '').trim() || email.split('@')[0],
    userId: body.userId && UUID_RE.test(body.userId) ? body.userId : null,
  };
}

// Reaproveita o cliente Asaas com o mesmo CPF/CNPJ ou cria um novo (sem notificações pagas do Asaas)
async function findOrCreateCustomer(env: Env, payer: Payer): Promise<string> {
  const found = await asaasRequest<{ data: Array<{ id: string }> }>(env, `/customers?cpfCnpj=${payer.cpf}&limit=1`);
  if (found.data.length > 0) return found.data[0].id;

  const created = await asaasRequest<{ id: string }>(env, '/customers', 'POST', {
    name: payer.name,
    email: payer.email,
    cpfCnpj: payer.cpf,
    notificationDisabled: true,
  });
  return created.id;
}

async function createCharge(env: Env, payer: Payer, extra: object): Promise<AsaasPayment> {
  const customer = await findOrCreateCustomer(env, payer);
  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return asaasRequest<AsaasPayment>(env, '/payments', 'POST', {
    customer,
    value: PLAN.value,
    dueDate,
    description: PLAN.description,
    externalReference: payer.userId ?? undefined,
    ...extra,
  });
}

function errorResponse(err: unknown, fallback: string) {
  console.error(fallback, err);
  const message = err instanceof AsaasError ? err.message : fallback;
  return jsonResponse({ success: false, error: message }, err instanceof AsaasError && err.status < 500 ? 400 : 502);
}

// ─── POST /api/create-payment (Pix) ───────────────────────────────────────────
async function handleCreatePayment(request: Request, env: Env): Promise<Response> {
  const payer = await readPayer(request);
  if (typeof payer === 'string') return jsonResponse({ success: false, error: payer }, 400);

  try {
    const payment = await createCharge(env, payer, { billingType: 'PIX' });
    const qr = await asaasRequest<{ encodedImage: string; payload: string }>(env, `/payments/${payment.id}/pixQrCode`);

    return jsonResponse({
      success: true,
      payment_id: payment.id,
      status: payment.status,
      qr_code: qr.payload,
      qr_code_base64: `data:image/png;base64,${qr.encodedImage}`,
      ticket_url: payment.invoiceUrl,
      amount: PLAN.value,
    });
  } catch (err) {
    return errorResponse(err, 'Erro ao criar cobrança Pix no Asaas');
  }
}

// ─── POST /api/create-preference (cartão) ─────────────────────────────────────
async function handleCreatePreference(request: Request, env: Env): Promise<Response> {
  const payer = await readPayer(request);
  if (typeof payer === 'string') return jsonResponse({ success: false, error: payer }, 400);

  try {
    const payment = await createCharge(env, payer, {
      billingType: 'CREDIT_CARD',
      callback: { successUrl: SUCCESS_URL, autoRedirect: true },
    });

    return jsonResponse({
      success: true,
      preference_id: payment.id,
      init_point: payment.invoiceUrl,
    });
  } catch (err) {
    return errorResponse(err, 'Erro ao criar cobrança no cartão no Asaas');
  }
}

// ─── GET /api/payment-status/:id ─────────────────────────────────────────────
async function handlePaymentStatus(paymentId: string, env: Env): Promise<Response> {
  if (!/^pay_\w+$/.test(paymentId)) {
    return jsonResponse({ error: 'Pagamento não encontrado' }, 404);
  }

  try {
    const payment = await asaasRequest<AsaasPayment>(env, `/payments/${paymentId}`);
    return jsonResponse({
      payment_id: payment.id,
      status: payment.status,
      amount: payment.value,
      approved: PAID_STATUSES.includes(payment.status),
    });
  } catch {
    return jsonResponse({ error: 'Pagamento não encontrado' }, 404);
  }
}

// ─── Supabase Helpers ─────────────────────────────────────────────────────────
function supabaseHeaders(env: Env): Record<string, string> {
  return {
    'apikey': env.SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
}

// Atualiza os perfis que casam com o filtro e devolve quantos foram atualizados
async function supabasePatchProfiles(env: Env, filter: string, fields: object): Promise<number> {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?${filter}`, {
    method: 'PATCH',
    headers: supabaseHeaders(env),
    body: JSON.stringify(fields),
  });
  if (!response.ok) throw new Error(`Supabase PATCH ${response.status}: ${await response.text()}`);
  return (await response.json() as unknown[]).length;
}

// Devolve false quando não há usuário nem perfil para vincular (liberar manualmente pelo painel admin)
async function activateSubscription(env: Env, payment: AsaasPayment): Promise<boolean> {
  const paidAt = payment.confirmedDate || payment.paymentDate || new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  const fields = {
    has_subscription: true,
    subscription_status: 'active',
    subscription_plan: PLAN.name,
    subscription_expires_at: new Date(new Date(paidAt).getTime() + PLAN.days * 24 * 60 * 60 * 1000).toISOString(),
    payment_id: payment.id,
    updated_at: now,
  };

  // profiles.id é o mesmo id do usuário no Supabase Auth
  const userId = payment.externalReference && UUID_RE.test(payment.externalReference) ? payment.externalReference : null;

  // 1. Pelo id do usuário gravado na cobrança
  if (userId && await supabasePatchProfiles(env, `id=eq.${userId}`, fields) > 0) return true;

  // 2. Pelo e-mail do cliente no Asaas
  const customer = await asaasRequest<{ email?: string }>(env, `/customers/${payment.customer}`);
  const email = customer.email?.trim().toLowerCase();
  if (email && await supabasePatchProfiles(env, `email=eq.${encodeURIComponent(email)}`, fields) > 0) return true;

  // 3. Usuário existe mas ainda não tem perfil: cria com o mesmo id
  if (userId) {
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: supabaseHeaders(env),
      body: JSON.stringify({ id: userId, email, full_name: email?.split('@')[0], created_at: now, ...fields }),
    });
    if (!response.ok) throw new Error(`Supabase POST ${response.status}: ${await response.text()}`);
    return true;
  }

  return false;
}

// ─── POST /api/webhook/asaas ─────────────────────────────────────────────────
async function handleWebhook(request: Request, env: Env): Promise<Response> {
  if (request.headers.get('asaas-access-token') !== env.ASAAS_WEBHOOK_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  let event: { id?: string; event?: string; payment?: { id?: string } };
  try {
    event = await request.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  console.log('🔔 Webhook Asaas recebido:', event.id, event.event, event.payment?.id);

  if ((event.event === 'PAYMENT_RECEIVED' || event.event === 'PAYMENT_CONFIRMED') && event.payment?.id) {
    try {
      // Reconsulta a cobrança no Asaas em vez de confiar apenas no corpo do evento
      const payment = await asaasRequest<AsaasPayment>(env, `/payments/${event.payment.id}`);

      if (PAID_STATUSES.includes(payment.status) && payment.value >= PLAN.value) {
        if (await activateSubscription(env, payment)) {
          console.log(`✅ Assinatura ativada para a cobrança ${payment.id}`);
        } else {
          console.error(`❌ Cobrança ${payment.id} paga, mas nenhum usuário/perfil encontrado — liberar manualmente`);
        }
      } else {
        console.log(`⚠️ Cobrança ${payment.id} ignorada: status ${payment.status}, valor ${payment.value}`);
      }
    } catch (err) {
      // Erro 5xx faz o Asaas reenviar o evento mais tarde
      console.error('Erro ao processar webhook Asaas:', err);
      return new Response('Erro ao processar evento', { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── Autenticação (sessão do Supabase enviada pelo site) ──────────────────────
interface ProfileRow {
  role?: string | null;
  has_subscription?: boolean | null;
  subscription_status?: string | null;
  subscription_expires_at?: string | null;
}

interface AuthUser {
  userId: string;
  email: string;
  isAdmin: boolean;
  profile: ProfileRow | null;
}

// Admin vem só da lista do servidor (ADMIN_EMAILS), nunca de um campo que o usuário possa editar
async function authenticate(request: Request, env: Env): Promise<AuthUser | Response> {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return jsonResponse({ error: 'Faça login para continuar.' }, 401);

  const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${token}` },
  });
  if (!userRes.ok) return jsonResponse({ error: 'Sua sessão expirou. Entre novamente na sua conta.' }, 401);
  const user = await userRes.json() as { id: string; email?: string };

  const profileRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=role,has_subscription,subscription_status,subscription_expires_at`,
    { headers: supabaseHeaders(env) }
  );
  const profile = profileRes.ok ? ((await profileRes.json()) as ProfileRow[])[0] ?? null : null;

  const email = (user.email || '').toLowerCase();
  const adminEmails = (env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  return { userId: user.id, email, isAdmin: adminEmails.includes(email), profile };
}

function hasActiveSubscription(profile: ProfileRow | null): boolean {
  if (!profile) return false;
  const active = profile.has_subscription === true || profile.subscription_status === 'active';
  const notExpired = !profile.subscription_expires_at || new Date(profile.subscription_expires_at).getTime() > Date.now();
  return active && notExpired;
}

// ─── POST /api/ai/generate ───────────────────────────────────────────────────
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
// Modelos em ordem de preferência: se um estiver sobrecarregado (503) ou sem cota (429), tenta o próximo
const GEMINI_MODELS = ['gemini-flash-latest', 'gemini-3.5-flash', 'gemini-flash-lite-latest'];
const MAX_AI_BODY_BYTES = 20 * 1024 * 1024;

async function handleAiGenerate(request: Request, env: Env): Promise<Response> {
  const auth = await authenticate(request, env);
  if (auth instanceof Response) return auth;

  if (!auth.isAdmin && !hasActiveSubscription(auth.profile)) {
    return jsonResponse({ error: 'É necessário ter uma assinatura ativa para usar a análise.' }, 402);
  }

  const { success } = await env.AI_LIMITER.limit({ key: auth.userId });
  if (!success) {
    return jsonResponse({ error: 'Muitas solicitações seguidas. Aguarde 1 minuto e tente novamente.' }, 429);
  }

  // O corpo (pedido completo do Gemini, com o PDF em base64) é repassado sem ser interpretado
  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_AI_BODY_BYTES) {
    return jsonResponse({ error: 'Arquivo grande demais para análise.' }, 413);
  }

  let lastStatus = 0;
  for (let pass = 0; pass < 2; pass++) {
    if (pass > 0) await new Promise(resolve => setTimeout(resolve, 5000));

    for (const model of GEMINI_MODELS) {
      const response = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent`, {
        method: 'POST',
        headers: { 'x-goog-api-key': env.GEMINI_API_KEY, 'Content-Type': 'application/json' },
        body,
      });

      if (response.status === 429 || response.status >= 500) {
        lastStatus = response.status;
        console.warn(`Gemini ${model} indisponível (${response.status}), tentando o próximo modelo...`);
        continue;
      }

      return new Response(response.body, { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }
  }

  return jsonResponse({
    error: lastStatus === 429
      ? 'Limite de uso da IA atingido. Tente novamente em alguns minutos — se persistir, o limite diário acabou e renova na madrugada.'
      : 'O serviço de IA está sobrecarregado no momento. Tente novamente em alguns minutos.',
  }, 503);
}

// ─── Admin ───────────────────────────────────────────────────────────────────
async function requireAdmin(request: Request, env: Env): Promise<AuthUser | Response> {
  const auth = await authenticate(request, env);
  if (auth instanceof Response) return auth;
  if (!auth.isAdmin) return jsonResponse({ error: 'Acesso restrito a administradores.' }, 403);
  return auth;
}

// E-mails do Supabase Auth por id (perfis criados no cadastro nascem sem e-mail)
async function authEmailsById(env: Env): Promise<Map<string, string>> {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, { headers: supabaseHeaders(env) });
  if (!response.ok) return new Map();
  const { users } = await response.json() as { users: Array<{ id: string; email?: string }> };
  return new Map(users.filter(u => u.email).map(u => [u.id, u.email!.toLowerCase()]));
}

// GET /api/admin/users
async function handleAdminUsers(request: Request, env: Env): Promise<Response> {
  const auth = await requireAdmin(request, env);
  if (auth instanceof Response) return auth;

  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/profiles?select=id,email,full_name,role,has_subscription,subscription_status,subscription_plan,subscription_expires_at,created_at&order=created_at.desc`,
    { headers: supabaseHeaders(env) }
  );
  if (!response.ok) return jsonResponse({ error: 'Erro ao carregar usuários.' }, 502);

  const profiles = await response.json() as Array<{ id: string; email: string | null }>;
  const emails = await authEmailsById(env);
  return jsonResponse({ users: profiles.map(p => ({ ...p, email: p.email || emails.get(p.id) || null })) });
}

// POST /api/admin/subscription — { id?, email?, active }
async function handleAdminSubscription(request: Request, env: Env): Promise<Response> {
  const auth = await requireAdmin(request, env);
  if (auth instanceof Response) return auth;

  let body: { id?: string; email?: string; active?: boolean };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'JSON inválido no corpo da requisição' }, 400);
  }

  let userId = body.id && UUID_RE.test(body.id) ? body.id : null;
  const email = body.email?.trim().toLowerCase();
  if (!userId && email) {
    for (const [id, authEmail] of await authEmailsById(env)) {
      if (authEmail === email) userId = id;
    }
  }
  if (!userId) {
    return jsonResponse({ error: 'Usuário não encontrado. Peça para a pessoa criar a conta no site primeiro.' }, 404);
  }

  const active = body.active !== false;
  const fields = {
    has_subscription: active,
    subscription_status: active ? 'active' : 'inactive',
    subscription_plan: active ? PLAN.name : null,
    subscription_expires_at: active ? new Date(Date.now() + PLAN.days * 24 * 60 * 60 * 1000).toISOString() : null,
    payment_id: active ? `ADMIN-${auth.email}-${new Date().toISOString().slice(0, 10)}` : null,
    updated_at: new Date().toISOString(),
    ...(email && { email }),
  };

  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: supabaseHeaders(env),
    body: JSON.stringify(fields),
  });
  if (!response.ok) return jsonResponse({ error: 'Erro ao atualizar a assinatura.' }, 502);
  const rows = await response.json() as unknown[];
  if (rows.length === 0) return jsonResponse({ error: 'Perfil do usuário não encontrado.' }, 404);

  console.log(`👤 Admin ${auth.email} ${active ? 'liberou' : 'revogou'} a assinatura de ${userId}`);
  return jsonResponse({ user: rows[0] });
}

// ─── Main Router ──────────────────────────────────────────────────────────────
async function route(request: Request, env: Env, path: string, method: string): Promise<Response> {
  // Health check
  if (path === '/api/health') {
    return jsonResponse({ status: 'ok', provider: 'asaas', environment: env.ENVIRONMENT, timestamp: new Date().toISOString() });
  }

  // Limite por IP para criação de cobranças (evita criação em massa de clientes/cobranças no Asaas)
  if ((path === '/api/create-payment' || path === '/api/create-preference') && method === 'POST') {
    const ip = request.headers.get('CF-Connecting-IP') || 'desconhecido';
    const { success } = await env.PAYMENT_LIMITER.limit({ key: ip });
    if (!success) {
      return jsonResponse({ success: false, error: 'Muitas tentativas seguidas. Aguarde 1 minuto e tente novamente.' }, 429);
    }
    return path === '/api/create-payment' ? handleCreatePayment(request, env) : handleCreatePreference(request, env);
  }

  // Consultar status de cobrança
  const statusMatch = path.match(/^\/api\/payment-status\/(.+)$/);
  if (statusMatch && method === 'GET') {
    return handlePaymentStatus(statusMatch[1], env);
  }

  // Receber webhook do Asaas
  if (path === '/api/webhook/asaas' && method === 'POST') {
    return handleWebhook(request, env);
  }

  // IA (Gemini) — exige login e assinatura
  if (path === '/api/ai/generate' && method === 'POST') {
    return handleAiGenerate(request, env);
  }

  // Admin
  if (path === '/api/admin/users' && method === 'GET') {
    return handleAdminUsers(request, env);
  }
  if (path === '/api/admin/subscription' && method === 'POST') {
    return handleAdminSubscription(request, env);
  }

  return jsonResponse({ error: 'Rota não encontrada' }, 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    const response = await route(request, env, url.pathname, request.method);

    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(corsHeaders(request))) headers.set(name, value);
    headers.set('X-Content-Type-Options', 'nosniff');
    return new Response(response.body, { status: response.status, headers });
  },

  // Mantém o projeto gratuito do Supabase ativo (ele pausa após ~7 dias sem uso)
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, { headers: supabaseHeaders(env) });
    console.log(`💓 Keep-alive do Supabase: HTTP ${response.status}`);
  },
} satisfies ExportedHandler<Env>;
