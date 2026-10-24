/**
 * Payment Service — ValidaImóvel (Asaas)
 *
 * ✅ Seguro para produção: a chave de API do Asaas e o preço do plano NÃO estão no frontend.
 * Todas as chamadas ao Asaas são feitas via Cloudflare Worker (/api/*).
 */

import { API_BASE_URL as WORKER_BASE_URL } from './apiClient';

// Se o domínio principal falhar, tenta o endereço workers.dev do mesmo Worker
const WORKER_FALLBACK_URL = 'https://validaimovel-payment-api.elizandro-aquino.workers.dev';

export interface PayerData {
  name: string;
  email: string;
  cpf: string;
  userId?: string;
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

// Valida os dígitos verificadores do CPF (o Asaas exige CPF/CNPJ do pagador)
export const isValidCpf = (value: string): boolean => {
  const cpf = value.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digit = (length: number) => {
    const sum = cpf
      .slice(0, length)
      .split('')
      .reduce((acc, n, i) => acc + Number(n) * (length + 1 - i), 0);
    return ((sum * 10) % 11) % 10;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
};

// Formata como 000.000.000-00 enquanto o usuário digita
export const formatCpf = (value: string): string =>
  value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

// Chama o Worker no domínio principal e, se a rede falhar, no endereço workers.dev
const workerFetch = async (path: string, init?: RequestInit): Promise<Response> => {
  try {
    return await fetch(`${WORKER_BASE_URL}${path}`, init);
  } catch (e) {
    console.warn('⚡ Primário falhou, usando fallback workers.dev...', e);
    return fetch(`${WORKER_FALLBACK_URL}${path}`, init);
  }
};

const postPayer = (path: string, payer: PayerData) =>
  workerFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payer, cpf: payer.cpf.replace(/\D/g, '') }),
  });

export const paymentService = {
  /**
   * Cria uma cobrança Pix no Asaas via Cloudflare Worker e devolve o QR Code.
   */
  createPixPayment: async (payer: PayerData): Promise<PixPaymentResult> => {
    console.log('💳 Criando cobrança Pix via Worker...', { email: payer.email, userId: payer.userId });

    try {
      const response = await postPayer('/api/create-payment', payer);
      const result = await response.json() as PixPaymentResult;

      if (response.ok && result.success) {
        console.log('✅ Pix criado com sucesso. Payment ID:', result.payment_id);
        return result;
      }

      console.error('❌ Worker retornou erro:', result);
      throw new Error(result.error || 'Erro ao criar pagamento');
    } catch (err) {
      console.error('Erro ao criar Pix via Worker:', err);
      return {
        success: false,
        payment_id: '',
        status: 'error',
        qr_code: null,
        qr_code_base64: null,
        ticket_url: null,
        amount: 49.90,
        error: err instanceof Error ? err.message : 'Erro de conexão com o servidor de pagamento',
      };
    }
  },

  /**
   * Cria uma cobrança no cartão de crédito e devolve o link da fatura do Asaas.
   */
  createCardPayment: async (payer: PayerData): Promise<CardPreferenceResult> => {
    try {
      const response = await postPayer('/api/create-preference', payer);
      return await response.json() as CardPreferenceResult;
    } catch (err) {
      console.error('Erro ao criar cobrança no cartão:', err);
      return {
        success: false,
        preference_id: '',
        init_point: '',
        error: 'Erro de conexão ao criar o pagamento no cartão',
      };
    }
  },

  /**
   * Consulta o status real de uma cobrança.
   */
  checkPaymentStatus: async (paymentId: string): Promise<{ status: string; approved: boolean }> => {
    if (!paymentId) {
      return { status: 'error', approved: false };
    }

    try {
      const response = await workerFetch(`/api/payment-status/${paymentId}`);
      if (response.ok) {
        return await response.json() as { status: string; approved: boolean };
      }
    } catch (err) {
      console.error('Erro ao consultar status:', err);
    }

    return { status: 'pending', approved: false };
  },
};
