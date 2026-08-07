// Webhook Service for Automated Pix Payment Processing (R$ 49.90 / 3 Months Unlimited)
import { subscriptionService } from './subscriptionService';

export interface PixWebhookPayload {
  event: 'PAYMENT_RECEIVED' | 'PIX_CONFIRMED';
  transactionId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  timestamp: string;
}

const WEBHOOK_LISTENERS: Array<(payload: PixWebhookPayload) => void> = [];

export const pixWebhookService = {
  // Inscreve um ouvinte para atualizações do Webhook em tempo real
  subscribe: (callback: (payload: PixWebhookPayload) => void) => {
    WEBHOOK_LISTENERS.push(callback);
    return () => {
      const idx = WEBHOOK_LISTENERS.indexOf(callback);
      if (idx > -1) WEBHOOK_LISTENERS.splice(idx, 1);
    };
  },

  // Processa uma notificação de Webhook vinda do gateway (EFI, Mercado Pago, Asaas, Pushin Pay, etc.)
  processWebhookPayload: (payload: PixWebhookPayload) => {
    console.log('⚡ Webhook Pix recebido:', payload);

    // Valida o valor da oferta de R$ 49,90 (com tolerância para centavos)
    if (payload.amount >= 40.00 && (payload.event === 'PAYMENT_RECEIVED' || payload.event === 'PIX_CONFIRMED')) {
      // Libera automaticamente 3 meses de acesso ilimitado
      subscriptionService.activate6MonthsUnlimited(payload.transactionId);

      // Notifica todos os ouvintes registrados
      WEBHOOK_LISTENERS.forEach(cb => cb(payload));
      return { success: true, message: 'Acesso de 3 meses ativado automaticamente via Webhook' };
    }

    return { success: false, message: 'Valor ou evento do Webhook inválido' };
  },

  // Simula o disparo imediato de Webhook para testes ou confirmação manual
  simulatePaymentConfirmation: (txId: string = 'TX-' + Math.random().toString(36).substring(2, 9).toUpperCase()) => {
    const payload: PixWebhookPayload = {
      event: 'PAYMENT_RECEIVED',
      transactionId: txId,
      amount: 49.90,
      currency: 'BRL',
      timestamp: new Date().toISOString()
    };

    return pixWebhookService.processWebhookPayload(payload);
  }
};
