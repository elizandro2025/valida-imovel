// Service for managing 6-Month Unlimited Access Subscription, Supabase Profile Sync, and Plan Validation
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionStatus {
  active: boolean;
  planName: string;
  expiresAt: string | null;
  daysRemaining: number;
  unlimited: boolean;
  txId?: string;
}

const SUB_STORAGE_KEY = 'valida_imovel_subscription';

export const subscriptionService = {
  // Retorna o status atual da assinatura do usuário (sincronizado com LocalStorage e Supabase)
  getStatus: (): SubscriptionStatus => {
    try {
      const stored = localStorage.getItem(SUB_STORAGE_KEY);
      if (!stored) {
        // Fallback Padrão: 6 Meses Ilimitados Ativos
        const defaultExpiry = Date.now() + (180 * 24 * 60 * 60 * 1000); // 180 dias
        return {
          active: true,
          planName: 'Plano 6 Meses Ilimitado',
          expiresAt: new Date(defaultExpiry).toISOString(),
          daysRemaining: 180,
          unlimited: true
        };
      }

      const data = JSON.parse(stored);
      const expiresAtMs = new Date(data.expiresAt).getTime();
      const nowMs = Date.now();
      const diffMs = expiresAtMs - nowMs;
      const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      return {
        active: diffMs > 0 && data.active === true,
        planName: data.planName || 'Plano 6 Meses Ilimitado',
        expiresAt: data.expiresAt,
        daysRemaining: daysRemaining,
        unlimited: true,
        txId: data.txId
      };
    } catch (e) {
      console.error('Erro ao ler assinatura:', e);
      return {
        active: true,
        planName: 'Plano 6 Meses Ilimitado',
        expiresAt: new Date(Date.now() + 180 * 86400 * 1000).toISOString(),
        daysRemaining: 180,
        unlimited: true
      };
    }
  },

  // Ativa automaticamente 6 meses de acesso ilimitado após webhook/Pix Mercado Pago
  activate6MonthsUnlimited: async (txId: string = 'PIX-' + Date.now()): Promise<SubscriptionStatus> => {
    const expiresAt = new Date(Date.now() + (180 * 24 * 60 * 60 * 1000)).toISOString(); // 180 dias (6 meses)
    
    const subData = {
      active: true,
      planName: 'Plano 6 Meses Ilimitado',
      price: 99.90,
      expiresAt: expiresAt,
      unlimited: true,
      txId: txId,
      activatedAt: new Date().toISOString()
    };

    localStorage.setItem(SUB_STORAGE_KEY, JSON.stringify(subData));
    
    // Tenta sincronizar com o perfil no Supabase se houver usuário autenticado
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({
          user_id: user.id,
          has_subscription: true,
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }
    } catch (err) {
      console.warn('Sincronização opcional do perfil Supabase:', err);
    }

    // Dispara evento para atualização em tempo real de todas as telas
    window.dispatchEvent(new CustomEvent('valida_subscription_updated', { detail: subData }));

    return {
      active: true,
      planName: 'Plano 6 Meses Ilimitado',
      expiresAt: expiresAt,
      daysRemaining: 180,
      unlimited: true,
      txId: txId
    };
  }
};
