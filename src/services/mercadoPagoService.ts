/**
 * Mercado Pago Service — ValidaImóvel
 *
 * ✅ Seguro para produção: o Access Token NÃO está no frontend.
 * Todas as chamadas à API do Mercado Pago são feitas via Cloudflare Worker (/api/*).
 */
import { pixWebhookService } from './pixWebhookService';

// URL base do Worker
// Em produção: https://api.validaimovel.com (ou fallback para workers.dev)
// Em dev local: http://localhost:8787
const WORKER_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8787'
    : 'https://api.validaimovel.com';

const WORKER_FALLBACK_URL = 'https://validaimovel-payment-api.validaimovel.workers.dev';

export interface MercadoPagoPaymentRequest {
  transaction_amount: number;
  description: string;
  userId?: string;
  cpf?: string;
  itemId?: string;
  itemTitle?: string;
  payer: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface MercadoPagoWebhookNotification {
  id: number;
  live_mode: boolean;
  type: 'payment';
  date_created: string;
  user_id: number;
  api_version: string;
  action: string;
  data: { id: string };
}

export interface PixPaymentResult {
  success: boolean;
  payment_id: string;
  status: string;
  qr_code: string | null;
  qr_code_base64: string | null;
  ticket_url: string | null;
  amount: number;
  error?: string;
}

export interface CardPreferenceResult {
  success: boolean;
  preference_id: string;
  init_point: string;
  error?: string;
}

export const mercadoPagoService = {
  /**
   * Cria um pagamento PIX real via Cloudflare Worker (seguro).
   * O Access Token fica no Worker — nunca exposto no frontend.
   */
  createPixPayment: async (data: Partial<MercadoPagoPaymentRequest> = {}): Promise<PixPaymentResult> => {
    const amount = data.transaction_amount || 49.90;
    const email = data.payer?.email || 'cliente@validaimovel.com.br';
    const name = [data.payer?.first_name, data.payer?.last_name].filter(Boolean).join(' ') || 'Cliente';
    const description = data.description || 'ValidaImóvel — 3 Meses de Acesso Ilimitado';
    const itemId = data.itemId || 'VALIVM-3M';
    const itemTitle = data.itemTitle || 'ValidaImóvel — Plano 3 Meses Ilimitado';
    const userId = data.userId;
    const cpf = data.cpf;

    console.log('💳 Criando Pagamento PIX via Worker...', { amount, email, description, userId });

    try {
      let response: Response;
      const payload = JSON.stringify({
        amount,
        email,
        name,
        description,
        itemId,
        itemTitle,
        userId,
        cpf,
      });

      try {
        response = await fetch(`${WORKER_BASE_URL}/api/create-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });
      } catch (e) {
        console.warn('⚡ Primário falhou, usando fallback workers.dev...', e);
        response = await fetch(`${WORKER_FALLBACK_URL}/api/create-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });
      }

      const result = await response.json() as PixPaymentResult;

      if (response.ok && result.success) {
        console.log('✅ PIX criado com sucesso. Payment ID:', result.payment_id);
        return result;
      }

      console.error('❌ Worker retornou erro:', result);
      throw new Error((result as { error?: string }).error || 'Erro ao criar pagamento');
    } catch (err) {
      console.error('Erro ao criar PIX via Worker:', err);
      return {
        success: false,
        payment_id: '',
        status: 'error',
        qr_code: null,
        qr_code_base64: null,
        ticket_url: null,
        amount,
        error: err instanceof Error ? err.message : 'Erro de conexão com o servidor de pagamento',
      };
    }
  },

  /**
   * Cria preferência de pagamento para checkout com cartão de crédito.
   */
  createCardPreference: async (email: string, name: string): Promise<CardPreferenceResult> => {
    try {
      let response: Response;
      try {
        response = await fetch(`${WORKER_BASE_URL}/api/create-preference`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name }),
        });
      } catch (e) {
        console.warn('⚡ Primário falhou, usando fallback workers.dev...', e);
        response = await fetch(`${WORKER_FALLBACK_URL}/api/create-preference`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name }),
        });
      }

      const result = await response.json() as CardPreferenceResult;
      return result;
    } catch (err) {
      console.error('Erro ao criar preferência de cartão:', err);
      return {
        success: false,
        preference_id: '',
        init_point: '',
        error: 'Erro de conexão ao criar preferência de pagamento',
      };
    }
  },

  /**
   * Consulta o status real de um pagamento.
   */
  checkPaymentStatus: async (paymentId: string): Promise<{ status: string; approved: boolean }> => {
    if (!paymentId || paymentId.startsWith('MP-ERR')) {
      return { status: 'error', approved: false };
    }

    try {
      let response: Response;
      try {
        response = await fetch(`${WORKER_BASE_URL}/api/payment-status/${paymentId}`);
      } catch (e) {
        response = await fetch(`${WORKER_FALLBACK_URL}/api/payment-status/${paymentId}`);
      }

      if (response.ok) {
        const data = await response.json() as { status: string; approved: boolean };
        return data;
      }
    } catch (err) {
      console.error('Erro ao consultar status:', err);
    }

    return { status: 'pending', approved: false };
  },

  /**
   * Processa notificação de webhook (chamado pelo Worker internamente via Supabase Realtime).
   * No frontend, a confirmação chega via Supabase Realtime — não via webhook direto.
   */
  handleWebhookNotification: async (notification: MercadoPagoWebhookNotification) => {
    console.log('🔔 Notificação de pagamento recebida:', notification);

    if (notification.type === 'payment' && notification.data?.id) {
      const txId = 'MP-' + notification.data.id;

      pixWebhookService.processWebhookPayload({
        event: 'PIX_CONFIRMED',
        transactionId: txId,
        amount: 49.90,
        currency: 'BRL',
        timestamp: new Date().toISOString(),
      });

      return {
        status: 200,
        message: 'Pagamento confirmado. Acesso ativado.',
      };
    }

    return { status: 400, message: 'Evento ignorado' };
  },
};
