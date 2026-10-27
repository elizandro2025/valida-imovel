/**
 * Cloudflare Worker — ValidaImovel API (pagamentos Asaas, IA Gemini e admin)
 *
 * Rotas:
 *   POST /api/auth/signup         — Cria a conta já confirmada (sem e-mail de confirmação); primeiro acesso liberado
 *   POST /api/create-payment      — Cria cobrança Pix no Asaas e devolve o QR Code
 *   POST /api/create-preference   — Cria cobrança no cartão e devolve o link da fatura Asaas
 *   GET  /api/payment-status/:id  — Consulta status de uma cobrança
 *   POST /api/webhook/asaas       — Recebe eventos do Asaas: ativa, renova ou estorna a assinatura
 *   POST /api/ai/ocr              — Lê o PDF (corpo = PDF em base64) — conta 1 análise do limite diário
 *   POST /api/ai/task             — Executa uma etapa da análise ({ task, text }) com os prompts do servidor
 *   POST /api/ai/chat             — Pergunta sobre um relatório ({ question, context })
 *   POST /api/client-error        — Registra erros do site no log do Worker
 *   GET  /api/admin/users         — Lista usuários (somente admin)
 *   GET  /api/admin/metrics       — Números reais de uso, pagamentos e saúde (somente admin)
 *   POST /api/admin/subscription  — Libera, renova ou revoga assinatura (somente admin)
 *
 * Cron diário: consulta o Supabase para o projeto gratuito não ser pausado por inatividade.
 */
import { ANALYSIS_TASKS, AnalysisTask, MAX_TASK_TEXT, buildChatRequest, buildOcrRequestParts, buildTaskRequest } from './prompts';

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
  SELFTEST_TOKEN?: string; // só no sandbox, durante testes automatizados
  FIRST_ACCESS_EMAILS?: string; // segredo: e-mails cujo primeiro login cria a conta com a senha digitada
  AI_LIMITER: RateLimiter;
  PAYMENT_LIMITER: RateLimiter;
  ERROR_LIMITER: RateLimiter;
}

// Preço e duração definidos no servidor — qualquer valor enviado pelo navegador é ignorado
interface Plan { value: number; days: number; name: string }
const PLAN = {
  value: 99.9,
  days: 30,
  name: 'Plano Mensal',
  description: 'ValidaImóvel — Plano Mensal (30 dias)',
};
// Cobranças criadas antes da mudança de preço (até 24/10/2026) ainda podem ser pagas ou estornadas depois dela:
// cada cobrança dá — e no estorno retira — os dias do plano que ela comprou
const LEGACY_PLANS: Plan[] = [{ value: 49.9, days: 90, name: 'Plano 3 Meses' }];

function planForValue(value: number): Plan | null {
  return [PLAN, ...LEGACY_PLANS].find(plan => value >= plan.value) ?? null;
}

// Uso justo por usuário e por dia (horário de Brasília); admins não têm limite
const DAILY_LIMITS = { analise: 30, tarefa: 120, chat: 150 } as const;
type UsageKind = keyof typeof DAILY_LIMITS;

// Para onde o Asaas devolve o cliente após pagar no cartão (domínio precisa estar cadastrado na conta Asaas)
const SUCCESS_URL = 'https://validaimovel.com/app';

const DAY_MS = 24 * 60 * 60 * 1000;
const PAID_STATUSES = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'];
const REVOKE_EVENTS: Record<string, string> = {
  PAYMENT_REFUNDED: 'estornado',
  PAYMENT_CHARGEBACK_REQUESTED: 'chargeback',
  PAYMENT_RECEIVED_IN_CASH_UNDONE: 'desfeito',
};
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface AsaasPayment {
  id: string;
  customer: string;
  status: string;
  value: number;
  billingType?: string;
  invoiceUrl: string;
  transactionReceiptUrl?: string | null;
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
    'Access-Control-Expose-Headers': 'X-AI-Model',
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
  const dueDate = new Date(Date.now() + DAY_MS).toISOString().slice(0, 10);

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

async function supabaseSelect<T>(env: Env, query: string): Promise<T[] | null> {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${query}`, { headers: supabaseHeaders(env) });
  if (!response.ok) {
    console.warn(`Supabase GET ${query.split('?')[0]}: HTTP ${response.status}`);
    return null;
  }
  return response.json() as Promise<T[]>;
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

interface SubscriptionProfile {
  id: string;
  email?: string | null;
  has_subscription?: boolean | null;
  subscription_status?: string | null;
  subscription_expires_at?: string | null;
  payment_id?: string | null;
}

const PROFILE_FIELDS = 'id,email,has_subscription,subscription_status,subscription_expires_at,payment_id';

async function findProfile(env: Env, filter: string): Promise<SubscriptionProfile | null> {
  const rows = await supabaseSelect<SubscriptionProfile>(env, `profiles?${filter}&select=${PROFILE_FIELDS}&limit=1`);
  return rows?.[0] ?? null;
}

// Fim do acesso atual se ainda estiver valendo (renovação soma a partir daí), senão agora
function renewalBase(profile: SubscriptionProfile | null): number {
  const now = Date.now();
  if (!profile) return now;
  const expires = profile.subscription_expires_at ? Date.parse(profile.subscription_expires_at) : 0;
  const active = profile.has_subscription === true || profile.subscription_status === 'active';
  return active && expires > now ? expires : now;
}

function activeFields(base: number, paymentId: string, plan: Plan) {
  return {
    has_subscription: true,
    subscription_status: 'active',
    subscription_plan: plan.name,
    subscription_expires_at: new Date(base + plan.days * DAY_MS).toISOString(),
    payment_id: paymentId,
    updated_at: new Date().toISOString(),
  };
}

// Cobrança já aplicada a alguém: o histórico (valida_payments) é gravado logo depois de cada ativação.
// Sem a tabela (migração pendente), devolve false e vale só a conferência pelo perfil.
async function alreadyApplied(env: Env, paymentId: string): Promise<boolean> {
  const rows = await supabaseSelect<{ user_id: string | null; status: string }>(
    env, `valida_payments?payment_id=eq.${encodeURIComponent(paymentId)}&select=user_id,status&limit=1`,
  );
  const row = rows?.[0];
  return Boolean(row?.user_id && row.status === 'pago');
}

async function customerEmail(env: Env, customerId: string): Promise<string | null> {
  const customer = await asaasRequest<{ email?: string }>(env, `/customers/${customerId}`);
  return customer.email?.trim().toLowerCase() || null;
}

// Ativa ou renova (somando aos dias restantes). Devolve o id do usuário, ou null quando não há a quem vincular.
async function activateSubscription(env: Env, payment: AsaasPayment, plan: Plan): Promise<string | null> {
  // profiles.id é o mesmo id do usuário no Supabase Auth
  const userId = payment.externalReference && UUID_RE.test(payment.externalReference) ? payment.externalReference : null;

  // 1. Pelo id do usuário gravado na cobrança; 2. pelo e-mail do cliente no Asaas
  let profile = userId ? await findProfile(env, `id=eq.${userId}`) : null;
  let email: string | null = null;
  if (!profile) {
    email = await customerEmail(env, payment.customer);
    if (email) profile = await findProfile(env, `email=eq.${encodeURIComponent(email)}`);
  }

  if (profile) {
    // O Asaas manda mais de um evento por cobrança (CONFIRMED e depois RECEIVED): aplica uma vez só. No cartão, o
    // RECEIVED chega na liquidação, semanas depois; se o cliente renovou nesse meio-tempo, o perfil já tem outra cobrança
    if (profile.payment_id === payment.id || await alreadyApplied(env, payment.id)) return profile.id;
    await supabasePatchProfiles(env, `id=eq.${profile.id}`, activeFields(renewalBase(profile), payment.id, plan));
    return profile.id;
  }

  // 3. Usuário existe mas ainda não tem perfil: cria com o mesmo id
  if (userId) {
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: supabaseHeaders(env),
      body: JSON.stringify({
        id: userId, email, full_name: email?.split('@')[0], created_at: new Date().toISOString(),
        ...activeFields(Date.now(), payment.id, plan),
      }),
    });
    if (!response.ok) throw new Error(`Supabase POST ${response.status}: ${await response.text()}`);
    return userId;
  }

  return null;
}

// Estorno ou chargeback: retira os dias que aquela cobrança deu. Devolve o id do usuário afetado.
async function revokeSubscription(env: Env, payment: AsaasPayment, reason: string): Promise<string | null> {
  const profile = await findProfile(env, `payment_id=eq.${encodeURIComponent(payment.id)}`);
  if (!profile) {
    console.warn(`Cobrança ${payment.id} (${reason}) não é a última aplicada a nenhum perfil — revisar manualmente`);
    return null;
  }

  const days = (planForValue(payment.value) ?? PLAN).days;
  const expires = (profile.subscription_expires_at ? Date.parse(profile.subscription_expires_at) : Date.now()) - days * DAY_MS;
  const stillActive = expires > Date.now();
  await supabasePatchProfiles(env, `id=eq.${profile.id}`, {
    has_subscription: stillActive,
    subscription_status: stillActive ? 'active' : reason,
    subscription_expires_at: new Date(Math.max(expires, Date.now())).toISOString(),
    payment_id: `${payment.id}:${reason}`, // evita descontar duas vezes se o evento repetir
    updated_at: new Date().toISOString(),
  });
  return profile.id;
}

// Histórico de pagamentos (comprovantes para o cliente, receita e pendências no admin). Falha aqui não bloqueia nada.
async function recordPayment(env: Env, payment: AsaasPayment, userId: string | null, status: string): Promise<void> {
  try {
    const email = userId ? null : await customerEmail(env, payment.customer).catch(() => null);
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/valida_payments?on_conflict=payment_id`, {
      method: 'POST',
      headers: { ...supabaseHeaders(env), Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        payment_id: payment.id,
        user_id: userId,
        ...(email && { customer_email: email }),
        value: payment.value,
        billing_type: payment.billingType ?? null,
        status,
        receipt_url: payment.transactionReceiptUrl ?? null,
        invoice_url: payment.invoiceUrl ?? null,
        paid_at: payment.confirmedDate || payment.paymentDate || null,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!response.ok) console.warn(`Histórico de pagamento não gravado (${response.status}): ${await response.text()}`);
  } catch (err) {
    console.warn('Histórico de pagamento não gravado:', err);
  }
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
  const isPaid = event.event === 'PAYMENT_RECEIVED' || event.event === 'PAYMENT_CONFIRMED';
  const revokeReason = event.event ? REVOKE_EVENTS[event.event] : undefined;

  if ((isPaid || revokeReason) && event.payment?.id) {
    try {
      // Reconsulta a cobrança no Asaas em vez de confiar apenas no corpo do evento
      const payment = await asaasRequest<AsaasPayment>(env, `/payments/${event.payment.id}`);

      const plan = planForValue(payment.value);
      if (isPaid && PAID_STATUSES.includes(payment.status) && plan) {
        const userId = await activateSubscription(env, payment, plan);
        if (userId) {
          console.log(`✅ Assinatura ativada/renovada para a cobrança ${payment.id}`);
        } else {
          console.error(`❌ Cobrança ${payment.id} paga, mas nenhum usuário/perfil encontrado — aparece no admin para vincular`);
        }
        await recordPayment(env, payment, userId, 'pago');
      } else if (revokeReason) {
        const userId = await revokeSubscription(env, payment, revokeReason);
        console.log(`↩️ Cobrança ${payment.id}: ${revokeReason} — acesso ajustado para ${userId ?? 'ninguém'}`);
        await recordPayment(env, payment, userId, revokeReason);
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
  selftest?: boolean;
}

function adminEmails(env: Env): string[] {
  return (env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
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

  const profile = (await supabaseSelect<ProfileRow>(
    env, `profiles?id=eq.${user.id}&select=role,has_subscription,subscription_status,subscription_expires_at`,
  ))?.[0] ?? null;

  const email = (user.email || '').toLowerCase();
  return { userId: user.id, email, isAdmin: adminEmails(env).includes(email), profile };
}

function hasActiveSubscription(profile: ProfileRow | null): boolean {
  if (!profile) return false;
  const active = profile.has_subscription === true || profile.subscription_status === 'active';
  const notExpired = !profile.subscription_expires_at || new Date(profile.subscription_expires_at).getTime() > Date.now();
  return active && notExpired;
}

// Testes automatizados da IA no sandbox: token próprio, nunca em produção, sem acesso ao banco
function selftestAuth(request: Request, env: Env): AuthUser | null {
  if (env.ENVIRONMENT !== 'sandbox' || !env.SELFTEST_TOKEN) return null;
  const token = request.headers.get('X-Selftest-Token') || '';
  if (token.length !== env.SELFTEST_TOKEN.length) return null;
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ env.SELFTEST_TOKEN.charCodeAt(i);
  return diff === 0 ? { userId: 'selftest', email: 'selftest', isAdmin: true, profile: null, selftest: true } : null;
}

// ─── Uso da IA (limite diário e métricas) ────────────────────────────────────
function startOfTodayBrazil(): string {
  const offset = 3 * 60 * 60 * 1000; // UTC-3
  const local = new Date(Date.now() - offset);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() + offset).toISOString();
}

// null quando a contagem não está disponível (ex.: tabela ainda não criada) — nesse caso não bloqueia
async function countUsageToday(env: Env, userId: string, kind: UsageKind): Promise<number | null> {
  const since = encodeURIComponent(startOfTodayBrazil());
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/valida_ai_usage?select=id&user_id=eq.${userId}&kind=eq.${kind}&created_at=gte.${since}`,
    { headers: { ...supabaseHeaders(env), Prefer: 'count=exact', Range: '0-0' } },
  );
  await response.body?.cancel();
  if (!response.ok) return null;
  const total = Number(response.headers.get('content-range')?.split('/')[1]);
  return Number.isFinite(total) ? total : null;
}

function recordUsage(env: Env, ctx: ExecutionContext, auth: AuthUser, kind: UsageKind, model: string | null, ok: boolean) {
  if (auth.selftest) return;
  ctx.waitUntil(
    fetch(`${env.SUPABASE_URL}/rest/v1/valida_ai_usage`, {
      method: 'POST',
      headers: { ...supabaseHeaders(env), Prefer: 'return=minimal' },
      body: JSON.stringify({ user_id: auth.userId, kind, model, ok }),
    }).then(r => r.body?.cancel()).catch(() => undefined),
  );
}

const LIMIT_MESSAGES: Record<UsageKind, string> = {
  analise: `Você atingiu o limite de uso justo de ${DAILY_LIMITS.analise} análises por dia. O limite renova à meia-noite (horário de Brasília).`,
  tarefa: 'Limite diário de processamento atingido. O limite renova à meia-noite (horário de Brasília).',
  chat: `Você atingiu o limite de ${DAILY_LIMITS.chat} perguntas por dia ao assistente. O limite renova à meia-noite (horário de Brasília).`,
};

// Login + assinatura + limite por minuto + uso justo diário
async function aiGuard(request: Request, env: Env, kind: UsageKind): Promise<AuthUser | Response> {
  const selftest = selftestAuth(request, env);
  if (selftest) return selftest;

  const auth = await authenticate(request, env);
  if (auth instanceof Response) return auth;

  if (!auth.isAdmin && !hasActiveSubscription(auth.profile)) {
    return jsonResponse({ error: 'É necessário ter uma assinatura ativa para usar a análise.' }, 402);
  }

  const { success } = await env.AI_LIMITER.limit({ key: auth.userId });
  if (!success) {
    return jsonResponse({ error: 'Muitas solicitações seguidas. Aguarde 1 minuto e tente novamente.' }, 429);
  }

  if (!auth.isAdmin) {
    const used = await countUsageToday(env, auth.userId, kind);
    if (used !== null && used >= DAILY_LIMITS[kind]) return jsonResponse({ error: LIMIT_MESSAGES[kind] }, 429);
  }
  return auth;
}

// ─── Gemini ──────────────────────────────────────────────────────────────────
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
// Modelos em ordem de preferência: se um estiver sobrecarregado (503) ou sem cota (429), tenta o próximo
const GEMINI_MODELS = ['gemini-flash-latest', 'gemini-3.5-flash', 'gemini-flash-lite-latest'];
const MAX_PDF_BASE64_BYTES = 20 * 1024 * 1024;
const MAX_CHAT_CONTEXT = 60_000;

// O corpo é um Blob ou texto, então pode ser reenviado a cada tentativa sem copiar o PDF
async function callGemini(env: Env, body: Blob | string): Promise<{ response: Response; model: string } | { failedStatus: number }> {
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
        await response.body?.cancel();
        console.warn(`Gemini ${model} indisponível (${response.status}), tentando o próximo modelo...`);
        continue;
      }
      return { response, model };
    }
  }
  return { failedStatus: lastStatus };
}

async function geminiResponse(
  env: Env, ctx: ExecutionContext, auth: AuthUser, kind: UsageKind, body: Blob | string,
): Promise<Response> {
  const result = await callGemini(env, body);
  if ('failedStatus' in result) {
    recordUsage(env, ctx, auth, kind, null, false);
    return jsonResponse({
      error: result.failedStatus === 429
        ? 'Limite de uso da IA atingido. Tente novamente em alguns minutos — se persistir, o limite diário acabou e renova na madrugada.'
        : 'O serviço de IA está sobrecarregado no momento. Tente novamente em alguns minutos.',
    }, 503);
  }

  recordUsage(env, ctx, auth, kind, result.model, result.response.ok);
  if (!result.response.ok) console.warn(`Gemini ${result.model} respondeu ${result.response.status} (${kind})`);
  return new Response(result.response.body, {
    status: result.response.status,
    headers: { 'Content-Type': 'application/json', 'X-AI-Model': result.model },
  });
}

// POST /api/ai/ocr — corpo: o PDF em base64 (texto puro)
async function handleAiOcr(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const auth = await aiGuard(request, env, 'analise');
  if (auth instanceof Response) return auth;

  const data = new Uint8Array(await request.arrayBuffer());
  if (data.byteLength > MAX_PDF_BASE64_BYTES) return jsonResponse({ error: 'Arquivo grande demais para análise (máximo de 15 MB).' }, 413);
  // "JVBER" é "%PDF" em base64; aspas ou barra invertida não existem em base64 e quebrariam o JSON
  const header = new TextDecoder().decode(data.subarray(0, 5));
  if (data.byteLength < 100 || header !== 'JVBER' || data.indexOf(0x22) !== -1 || data.indexOf(0x5c) !== -1) {
    return jsonResponse({ error: 'O arquivo enviado não é um PDF válido.' }, 400);
  }

  const { prefix, suffix } = buildOcrRequestParts();
  return geminiResponse(env, ctx, auth, 'analise', new Blob([prefix, data, suffix], { type: 'application/json' }));
}

// POST /api/ai/task — { task, text }
async function handleAiTask(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const auth = await aiGuard(request, env, 'tarefa');
  if (auth instanceof Response) return auth;

  let payload: { task?: string; text?: unknown };
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'JSON inválido no corpo da requisição' }, 400);
  }

  const task = payload.task as AnalysisTask;
  const text = typeof payload.text === 'string' ? payload.text : '';
  if (!ANALYSIS_TASKS.includes(task)) return jsonResponse({ error: 'Etapa de análise desconhecida.' }, 400);
  if (text.trim().length < 50) return jsonResponse({ error: 'Texto do documento vazio ou curto demais.' }, 400);
  if (text.length > MAX_TASK_TEXT) return jsonResponse({ error: 'Documento longo demais para uma única análise.' }, 413);

  return geminiResponse(env, ctx, auth, 'tarefa', JSON.stringify(buildTaskRequest(task, text)));
}

// POST /api/ai/chat — { question, context }
async function handleAiChat(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const auth = await aiGuard(request, env, 'chat');
  if (auth instanceof Response) return auth;

  let payload: { question?: unknown; context?: unknown };
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'JSON inválido no corpo da requisição' }, 400);
  }

  const question = typeof payload.question === 'string' ? payload.question.trim() : '';
  const context = typeof payload.context === 'string' ? payload.context : '';
  if (!question || question.length > 2000) return jsonResponse({ error: 'Escreva uma pergunta de até 2.000 caracteres.' }, 400);
  if (!context || context.length > MAX_CHAT_CONTEXT) return jsonResponse({ error: 'Relatório ausente ou grande demais.' }, 400);

  return geminiResponse(env, ctx, auth, 'chat', JSON.stringify(buildChatRequest(question, context)));
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

  const profiles = await supabaseSelect<{ id: string; email: string | null }>(
    env,
    'profiles?select=id,email,full_name,role,has_subscription,subscription_status,subscription_plan,subscription_expires_at,created_at&order=created_at.desc',
  );
  if (!profiles) return jsonResponse({ error: 'Erro ao carregar usuários.' }, 502);

  const emails = await authEmailsById(env);
  return jsonResponse({ users: profiles.map(p => ({ ...p, email: p.email || emails.get(p.id) || null })) });
}

// GET /api/admin/metrics — números reais (as tabelas valida_* vêm da migração em supabase/migrations)
async function handleAdminMetrics(request: Request, env: Env): Promise<Response> {
  const auth = await requireAdmin(request, env);
  if (auth instanceof Response) return auth;

  const now = Date.now();
  const iso = (ms: number) => encodeURIComponent(new Date(ms).toISOString());
  const today = Date.parse(startOfTodayBrazil());

  const [analyses, recent, payments, unlinked, subscribers] = await Promise.all([
    supabaseSelect<{ user_id: string; created_at: string }>(
      env, `valida_ai_usage?select=user_id,created_at&kind=eq.analise&created_at=gte.${iso(now - 30 * DAY_MS)}&limit=50000`),
    supabaseSelect<{ kind: string; model: string | null; ok: boolean }>(
      env, `valida_ai_usage?select=kind,model,ok&created_at=gte.${iso(now - DAY_MS)}&limit=50000`),
    supabaseSelect<{ value: number; status: string }>(
      env, `valida_payments?select=value,status&created_at=gte.${iso(now - 30 * DAY_MS)}&limit=10000`),
    supabaseSelect<{ payment_id: string; customer_email: string | null; value: number; paid_at: string | null; created_at: string }>(
      env, 'valida_payments?select=payment_id,customer_email,value,paid_at,created_at&user_id=is.null&status=eq.pago&order=created_at.desc&limit=50'),
    supabaseSelect<{ id: string }>(
      env, `profiles?select=id&has_subscription=eq.true&subscription_expires_at=gt.${iso(now)}&limit=10000`),
  ]);

  const since = (rows: Array<{ created_at: string }>, ms: number) => rows.filter(r => Date.parse(r.created_at) >= ms).length;
  const models: Record<string, number> = {};
  for (const row of recent ?? []) if (row.model) models[row.model] = (models[row.model] || 0) + 1;
  const paid = (payments ?? []).filter(p => p.status === 'pago');

  return jsonResponse({
    environment: env.ENVIRONMENT,
    tables_ready: analyses !== null && payments !== null,
    analyses: analyses && {
      today: since(analyses, today),
      last_7_days: since(analyses, now - 7 * DAY_MS),
      last_30_days: analyses.length,
      active_users_7_days: new Set(analyses.filter(a => Date.parse(a.created_at) >= now - 7 * DAY_MS).map(a => a.user_id)).size,
    },
    ai_last_24h: recent && {
      calls: recent.length,
      failures: recent.filter(r => !r.ok).length,
      models,
    },
    payments_last_30_days: payments && {
      count: paid.length,
      revenue: Math.round(paid.reduce((sum, p) => sum + Number(p.value || 0), 0) * 100) / 100,
      refunds: payments.filter(p => p.status !== 'pago').length,
    },
    unlinked_payments: unlinked ?? [],
    active_subscribers: subscribers?.length ?? null,
    services: {
      database: subscribers !== null,
      ai_key_configured: Boolean(env.GEMINI_API_KEY),
      payments_key_configured: Boolean(env.ASAAS_API_KEY),
    },
  });
}

// POST /api/admin/subscription — { id?, email?, active, payment_id? }
async function handleAdminSubscription(request: Request, env: Env): Promise<Response> {
  const auth = await requireAdmin(request, env);
  if (auth instanceof Response) return auth;

  let body: { id?: string; email?: string; active?: boolean; payment_id?: string };
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
  const linkedPayment = body.payment_id && /^pay_\w+$/.test(body.payment_id) ? body.payment_id : null;
  // Pagamento vinculado dá os dias do plano que ele comprou; liberação manual dá o plano atual
  const linkedValue = linkedPayment
    ? (await supabaseSelect<{ value: number }>(env, `valida_payments?payment_id=eq.${linkedPayment}&select=value&limit=1`))?.[0]?.value
    : undefined;
  const plan = (linkedValue !== undefined && planForValue(Number(linkedValue))) || PLAN;
  const fields = active
    ? activeFields(renewalBase(await findProfile(env, `id=eq.${userId}`)),
      linkedPayment || `ADMIN-${auth.email}-${new Date().toISOString().slice(0, 10)}`, plan)
    : {
      has_subscription: false,
      subscription_status: 'inactive',
      subscription_plan: null,
      subscription_expires_at: null,
      payment_id: null,
      updated_at: new Date().toISOString(),
    };

  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: supabaseHeaders(env),
    body: JSON.stringify({ ...fields, ...(email && { email }) }),
  });
  if (!response.ok) return jsonResponse({ error: 'Erro ao atualizar a assinatura.' }, 502);
  const rows = await response.json() as unknown[];
  if (rows.length === 0) return jsonResponse({ error: 'Perfil do usuário não encontrado.' }, 404);

  // Pagamento que chegou sem usuário: passa a constar no histórico da pessoa
  if (linkedPayment) {
    await fetch(`${env.SUPABASE_URL}/rest/v1/valida_payments?payment_id=eq.${linkedPayment}`, {
      method: 'PATCH',
      headers: { ...supabaseHeaders(env), Prefer: 'return=minimal' },
      body: JSON.stringify({ user_id: userId, updated_at: new Date().toISOString() }),
    }).catch(() => undefined);
  }

  console.log(`👤 Admin ${auth.email} ${active ? 'liberou' : 'revogou'} a assinatura de ${userId}${linkedPayment ? ` (cobrança ${linkedPayment})` : ''}`);
  return jsonResponse({ user: rows[0] });
}

// ─── POST /api/auth/signup ───────────────────────────────────────────────────
// Cadastro sem confirmação por e-mail: a conta é criada já confirmada pela API administrativa do Supabase.
// O projeto Supabase é compartilhado com o app BUPi, por isso a confirmação continua ligada no painel e só o
// ValidaImóvel a dispensa. Com firstAccess, vem da tela de login: só para e-mails em FIRST_ACCESS_EMAILS e só se a
// conta ainda não existe (nunca troca a senha de uma conta existente).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handleSignup(request: Request, env: Env): Promise<Response> {
  let body: { email?: string; password?: unknown; name?: unknown; firstAccess?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'JSON inválido no corpo da requisição' }, 400);
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!EMAIL_RE.test(email) || email.length > 254) return jsonResponse({ error: 'E-mail inválido. Verifique o endereço digitado.' }, 400);
  // 72 é o limite do bcrypt usado pelo Supabase
  if (password.length < 6 || password.length > 72) return jsonResponse({ error: 'A senha deve ter entre 6 e 72 caracteres.' }, 400);
  // Sem confirmação por e-mail, quem cadastrasse primeiro um e-mail de ADMIN_EMAILS que ainda não tem conta viraria administrador
  if (adminEmails(env).includes(email)) {
    return jsonResponse({ error: 'Este e-mail não pode ser cadastrado por aqui. Fale com o suporte.', code: 'reserved' }, 403);
  }

  const firstAccess = body.firstAccess === true;
  if (firstAccess) {
    const allowed = (env.FIRST_ACCESS_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    if (!allowed.includes(email)) return jsonResponse({ error: 'Primeiro acesso não liberado para este e-mail.', code: 'not_allowed' }, 403);
  }

  const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim().slice(0, 120) : email.split('@')[0];
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: supabaseHeaders(env),
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name: name } }),
  });
  if (response.ok) {
    console.log(`👤 Conta criada sem confirmação de e-mail${firstAccess ? ' (primeiro acesso liberado)' : ''}`);
    return jsonResponse({ created: true }, 201);
  }

  const detail = await response.text();
  if (response.status === 422 || /already been registered|already registered|email_exists|user_already_exists/i.test(detail)) {
    return jsonResponse({ error: 'Este e-mail já tem conta. Entre com sua senha.', code: 'exists' }, 409);
  }
  console.error(`Erro ao criar conta (Supabase ${response.status}): ${detail.slice(0, 300)}`);
  return jsonResponse({ error: 'Não foi possível criar a conta agora. Tente novamente em instantes.' }, 502);
}

// ─── POST /api/client-error ──────────────────────────────────────────────────
async function handleClientError(request: Request, env: Env): Promise<Response> {
  const ip = request.headers.get('CF-Connecting-IP') || 'desconhecido';
  const { success } = await env.ERROR_LIMITER.limit({ key: ip });
  if (success) console.error('🧯 Erro no site:', (await request.text()).slice(0, 4000));
  return new Response(null, { status: 204 });
}

// ─── Main Router ──────────────────────────────────────────────────────────────
async function route(request: Request, env: Env, ctx: ExecutionContext, path: string, method: string): Promise<Response> {
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

  // Cadastro (sem confirmação por e-mail): limite por IP contra criação de contas em massa
  if (path === '/api/auth/signup' && method === 'POST') {
    const ip = request.headers.get('CF-Connecting-IP') || 'desconhecido';
    const { success } = await env.PAYMENT_LIMITER.limit({ key: `signup:${ip}` });
    if (!success) return jsonResponse({ error: 'Muitas tentativas seguidas. Aguarde 1 minuto e tente novamente.' }, 429);
    return handleSignup(request, env);
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

  // IA (Gemini) — exige login e assinatura; os prompts ficam no servidor
  if (method === 'POST') {
    if (path === '/api/ai/ocr') return handleAiOcr(request, env, ctx);
    if (path === '/api/ai/task') return handleAiTask(request, env, ctx);
    if (path === '/api/ai/chat') return handleAiChat(request, env, ctx);
    if (path === '/api/client-error') return handleClientError(request, env);
  }

  // Admin
  if (path === '/api/admin/users' && method === 'GET') {
    return handleAdminUsers(request, env);
  }
  if (path === '/api/admin/metrics' && method === 'GET') {
    return handleAdminMetrics(request, env);
  }
  if (path === '/api/admin/subscription' && method === 'POST') {
    return handleAdminSubscription(request, env);
  }

  return jsonResponse({ error: 'Rota não encontrada' }, 404);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    const response = await route(request, env, ctx, url.pathname, request.method);

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
