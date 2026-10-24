/**
 * Cloudflare Worker — ValidaImovel Payment API (Asaas)
 *
 * Rotas:
 *   POST /api/create-payment      — Cria cobrança Pix no Asaas e devolve o QR Code
 *   POST /api/create-preference   — Cria cobrança no cartão e devolve o link da fatura Asaas
 *   GET  /api/payment-status/:id  — Consulta status de uma cobrança
 *   POST /api/webhook/asaas       — Recebe eventos do Asaas e ativa a assinatura no Supabase
 */

export interface Env {
  ASAAS_API_URL: string; // https://api.asaas.com/v3 (produção) ou https://api-sandbox.asaas.com/v3
  ASAAS_API_KEY: string;
  ASAAS_WEBHOOK_TOKEN: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  ENVIRONMENT: string;
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

// ─── CORS Headers ────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function corsResponse(body: string | object, status = 200) {
  const content = typeof body === 'string' ? body : JSON.stringify(body);
  return new Response(content, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
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
  return corsResponse({ success: false, error: message }, err instanceof AsaasError && err.status < 500 ? 400 : 502);
}

// ─── POST /api/create-payment (Pix) ───────────────────────────────────────────
async function handleCreatePayment(request: Request, env: Env): Promise<Response> {
  const payer = await readPayer(request);
  if (typeof payer === 'string') return corsResponse({ success: false, error: payer }, 400);

  try {
    const payment = await createCharge(env, payer, { billingType: 'PIX' });
    const qr = await asaasRequest<{ encodedImage: string; payload: string }>(env, `/payments/${payment.id}/pixQrCode`);

    return corsResponse({
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
  if (typeof payer === 'string') return corsResponse({ success: false, error: payer }, 400);

  try {
    const payment = await createCharge(env, payer, {
      billingType: 'CREDIT_CARD',
      callback: { successUrl: SUCCESS_URL, autoRedirect: true },
    });

    return corsResponse({
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
    return corsResponse({ error: 'Pagamento não encontrado' }, 404);
  }

  try {
    const payment = await asaasRequest<AsaasPayment>(env, `/payments/${paymentId}`);
    return corsResponse({
      payment_id: payment.id,
      status: payment.status,
      amount: payment.value,
      approved: PAID_STATUSES.includes(payment.status),
    });
  } catch {
    return corsResponse({ error: 'Pagamento não encontrado' }, 404);
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

// ─── Main Router ──────────────────────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Preflight CORS
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Health check
    if (path === '/api/health') {
      return corsResponse({ status: 'ok', provider: 'asaas', environment: env.ENVIRONMENT, timestamp: new Date().toISOString() });
    }

    // Criar cobrança Pix
    if (path === '/api/create-payment' && method === 'POST') {
      return handleCreatePayment(request, env);
    }

    // Criar cobrança no cartão
    if (path === '/api/create-preference' && method === 'POST') {
      return handleCreatePreference(request, env);
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

    return corsResponse({ error: 'Rota não encontrada' }, 404);
  },
} satisfies ExportedHandler<Env>;
