/**
 * Cloudflare Worker — ValidaImovel Payment API
 *
 * Rotas:
 *   POST /api/create-payment     — Cria pagamento PIX no Mercado Pago
 *   POST /api/create-preference  — Cria preferência para cartão de crédito
 *   POST /api/webhook/mercado-pago — Recebe IPN/Webhook do Mercado Pago
 *   GET  /api/payment-status/:id  — Consulta status de um pagamento
 */

export interface Env {
  MP_ACCESS_TOKEN: string;
  MP_WEBHOOK_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  ENVIRONMENT: string;
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

// ─── Mercado Pago API Helper ──────────────────────────────────────────────────
async function mpRequest(
  env: Env,
  path: string,
  method: string = 'GET',
  body?: object,
  idempotencyKey?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${env.MP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }

  return fetch(`https://api.mercadopago.com${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ─── Supabase Helper ──────────────────────────────────────────────────────────
async function supabaseUpdateSubscription(
  env: Env,
  userId: string,
  paymentId: string,
  amount: number
) {
  const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      user_id: userId,
      has_subscription: true,
      subscription_status: 'active',
      subscription_plan: 'Plano 6 Meses Ilimitado',
      subscription_expires_at: expiresAt,
      payment_id: paymentId,
      payment_amount: amount,
      updated_at: new Date().toISOString(),
    }),
  });

  return response.ok;
}

// ─── Supabase Lookup por email ─────────────────────────────────────────────────
async function supabaseFindUserByEmail(env: Env, email: string): Promise<string | null> {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=user_id&limit=1`,
    {
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  if (!response.ok) return null;
  const data = await response.json() as Array<{ user_id: string }>;
  return data.length > 0 ? data[0].user_id : null;
}

// ─── POST /api/create-payment ─────────────────────────────────────────────────
async function handleCreatePayment(request: Request, env: Env): Promise<Response> {
  let body: {
    email?: string;
    name?: string;
    amount?: number;
    description?: string;
  };

  try {
    body = await request.json();
  } catch {
    return corsResponse({ error: 'JSON inválido no corpo da requisição' }, 400);
  }

  const amount = body.amount || 99.90;
  const email = body.email || 'cliente@validaimovel.com.br';
  const firstName = (body.name || 'Cliente').split(' ')[0];
  const lastName = (body.name || 'ValidaImóvel').split(' ').slice(1).join(' ') || 'ValidaImóvel';
  const description = body.description || 'ValidaImóvel — 6 Meses de Acesso Ilimitado';
  const idempotencyKey = `VALIVM-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

  const mpBody = {
    transaction_amount: amount,
    description,
    payment_method_id: 'pix',
    payer: {
      email,
      first_name: firstName,
      last_name: lastName,
      identification: { type: 'CPF', number: '00000000000' },
    },
    notification_url: 'https://api.validaimovel.com/api/webhook/mercado-pago',
    additional_info: {
      items: [
        {
          id: 'VALIVM-6M',
          title: 'ValidaImóvel — Plano 6 Meses Ilimitado',
          description: 'Acesso ilimitado por 180 dias com IA Registrária',
          quantity: 1,
          unit_price: amount,
        },
      ],
    },
  };

  const mpRes = await mpRequest(env, '/v1/payments', 'POST', mpBody, idempotencyKey);

  if (!mpRes.ok) {
    const errData = await mpRes.json() as { message?: string };
    console.error('Mercado Pago API error:', mpRes.status, errData);
    return corsResponse(
      { error: 'Erro ao criar pagamento no Mercado Pago', details: errData },
      502
    );
  }

  const mpData = await mpRes.json() as {
    id: number;
    status: string;
    point_of_interaction?: {
      transaction_data?: {
        qr_code?: string;
        qr_code_base64?: string;
        ticket_url?: string;
      };
    };
    transaction_details?: { external_resource_url?: string };
  };

  const txData = mpData.point_of_interaction?.transaction_data;

  return corsResponse({
    success: true,
    payment_id: String(mpData.id),
    status: mpData.status,
    qr_code: txData?.qr_code || null,
    qr_code_base64: txData?.qr_code_base64
      ? `data:image/png;base64,${txData.qr_code_base64}`
      : null,
    ticket_url: txData?.ticket_url || mpData.transaction_details?.external_resource_url || null,
    amount,
  });
}

// ─── POST /api/create-preference ─────────────────────────────────────────────
async function handleCreatePreference(request: Request, env: Env): Promise<Response> {
  let body: { email?: string; name?: string } = {};
  try { body = await request.json(); } catch { /* ok */ }

  const email = body.email || 'cliente@validaimovel.com.br';
  const name = body.name || 'Cliente ValidaImóvel';

  const prefBody = {
    items: [
      {
        id: 'VALIVM-6M',
        title: 'ValidaImóvel — Plano 6 Meses Ilimitado',
        description: 'Acesso ilimitado por 180 dias com IA Registrária',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: 99.90,
      },
    ],
    payer: { name, email },
    payment_methods: {
      installments: 12,
      excluded_payment_types: [{ id: 'ticket' }, { id: 'atm' }],
    },
    back_urls: {
      success: 'https://validaimovel.com/pagamento?status=approved',
      failure: 'https://validaimovel.com/pagamento?status=failure',
      pending: 'https://validaimovel.com/pagamento?status=pending',
    },
    auto_return: 'approved',
    notification_url: 'https://validaimovel.com/api/webhook/mercado-pago',
    statement_descriptor: 'ValidaImovel',
    external_reference: `VALIVM-${Date.now()}`,
  };

  const mpRes = await mpRequest(env, '/checkout/preferences', 'POST', prefBody);

  if (!mpRes.ok) {
    const errData = await mpRes.json() as { message?: string };
    return corsResponse({ error: 'Erro ao criar preferência de pagamento', details: errData }, 502);
  }

  const prefData = await mpRes.json() as { id: string; init_point: string; sandbox_init_point: string };

  return corsResponse({
    success: true,
    preference_id: prefData.id,
    init_point: prefData.init_point,
    sandbox_init_point: prefData.sandbox_init_point,
  });
}

// ─── GET /api/payment-status/:id ─────────────────────────────────────────────
async function handlePaymentStatus(paymentId: string, env: Env): Promise<Response> {
  const mpRes = await mpRequest(env, `/v1/payments/${paymentId}`);

  if (!mpRes.ok) {
    return corsResponse({ error: 'Pagamento não encontrado' }, 404);
  }

  const data = await mpRes.json() as {
    id: number;
    status: string;
    status_detail: string;
    transaction_amount: number;
    payer?: { email?: string };
  };

  return corsResponse({
    payment_id: String(data.id),
    status: data.status,
    status_detail: data.status_detail,
    amount: data.transaction_amount,
    approved: data.status === 'approved',
  });
}

// ─── POST /api/webhook/mercado-pago ─────────────────────────────────────────
async function handleWebhook(request: Request, env: Env): Promise<Response> {
  let notification: {
    type?: string;
    action?: string;
    data?: { id?: string };
  };

  try {
    notification = await request.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  console.log('🔔 Webhook MP recebido:', JSON.stringify(notification));

  // Processa apenas eventos de pagamento aprovado
  if (notification.type === 'payment' && notification.data?.id) {
    const paymentId = notification.data.id;

    // Consulta o status real do pagamento na API do MP
    const mpRes = await mpRequest(env, `/v1/payments/${paymentId}`);

    if (mpRes.ok) {
      const payment = await mpRes.json() as {
        id: number;
        status: string;
        transaction_amount: number;
        payer?: { email?: string };
        external_reference?: string;
      };

      console.log(`💳 Payment ${paymentId} status: ${payment.status}`);

      if (payment.status === 'approved') {
        const payerEmail = payment.payer?.email;

        // Busca o userId no Supabase pelo email do pagador
        if (payerEmail) {
          const userId = await supabaseFindUserByEmail(env, payerEmail);
          if (userId) {
            const updated = await supabaseUpdateSubscription(
              env,
              userId,
              String(payment.id),
              payment.transaction_amount
            );
            console.log(`✅ Supabase subscription updated for user ${userId}: ${updated}`);
          } else {
            // Usuário ainda não cadastrado — armazena para ativar no login
            console.log(`⚠️ User not found for email ${payerEmail} — storing pending activation`);
            // TODO: inserir em tabela pending_activations se necessário
          }
        }
      }
    }
  }

  // Sempre retorna 200 para o Mercado Pago (evita reenvios)
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
      return corsResponse({ status: 'ok', environment: env.ENVIRONMENT, timestamp: new Date().toISOString() });
    }

    // Criar pagamento PIX
    if (path === '/api/create-payment' && method === 'POST') {
      return handleCreatePayment(request, env);
    }

    // Criar preferência para cartão
    if (path === '/api/create-preference' && method === 'POST') {
      return handleCreatePreference(request, env);
    }

    // Consultar status de pagamento
    const statusMatch = path.match(/^\/api\/payment-status\/(.+)$/);
    if (statusMatch && method === 'GET') {
      return handlePaymentStatus(statusMatch[1], env);
    }

    // Receber webhook do Mercado Pago
    if (path === '/api/webhook/mercado-pago' && method === 'POST') {
      return handleWebhook(request, env);
    }

    return corsResponse({ error: 'Rota não encontrada' }, 404);
  },
} satisfies ExportedHandler<Env>;
