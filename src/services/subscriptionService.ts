/**
 * Subscription Service — ValidaImóvel
 *
 * Gerencia o status de assinatura do usuário:
 * - LocalStorage (fallback imediato)
 * - Supabase profiles (persistência cross-device)
 * - Supabase Realtime (confirmação automática pós-pagamento)
 */
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionStatus {
  active: boolean;
  planName: string;
  expiresAt: string | null;
  daysRemaining: number;
  unlimited: boolean;
  txId?: string;
}

export interface ProfileSubscriptionData {
  has_subscription?: boolean | null;
  subscription_status?: string | null;
  subscription_expires_at?: string | null;
}

/**
 * Regra Única de Liberação:
 * Verifica se a assinatura no perfil é válida e não expirada.
 */
export const isSubscriptionActive = (profile?: ProfileSubscriptionData | null): boolean => {
  if (!profile) return false;
  const hasSub = profile.has_subscription === true;
  const isStatusActive = profile.subscription_status === 'active';
  const notExpired = Boolean(
    profile.subscription_expires_at &&
    new Date(profile.subscription_expires_at).getTime() > Date.now()
  );
  return hasSub && isStatusActive && notExpired;
};

const SUB_STORAGE_KEY = 'valida_imovel_subscription';

export const subscriptionService = {
  isSubscriptionActive,

  // Retorna o status atual da assinatura (LocalStorage + Supabase)
  getStatus: (): SubscriptionStatus => {
    try {
      const stored = localStorage.getItem(SUB_STORAGE_KEY);
      if (!stored) {
        return {
          active: false,
          planName: 'Sem Assinatura Ativa',
          expiresAt: null,
          daysRemaining: 0,
          unlimited: false,
        };
      }

      const data = JSON.parse(stored);
      const active = isSubscriptionActive({
        has_subscription: data.active,
        subscription_status: data.active ? 'active' : 'inactive',
        subscription_expires_at: data.expiresAt,
      });

      const expiresAtMs = data.expiresAt ? new Date(data.expiresAt).getTime() : 0;
      const daysRemaining = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / (1000 * 60 * 60 * 24)));

      return {
        active,
        planName: data.planName || 'Plano 6 Meses Ilimitado',
        expiresAt: data.expiresAt || null,
        daysRemaining,
        unlimited: true,
        txId: data.txId,
      };
    } catch (e) {
      console.error('Erro ao ler assinatura:', e);
      return {
        active: false,
        planName: 'Sem Assinatura Ativa',
        expiresAt: null,
        daysRemaining: 0,
        unlimited: false,
      };
    }
  },

  // Limpa assinatura (testes)
  clearSubscription: () => {
    localStorage.removeItem(SUB_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('valida_subscription_updated', { detail: { active: false } }));
  },

  // Ativa 6 meses de acesso ilimitado (chamado após confirmação de pagamento)
  activate6MonthsUnlimited: async (txId: string = 'PIX-' + Date.now()): Promise<SubscriptionStatus> => {
    const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

    const subData = {
      active: true,
      planName: 'Plano 6 Meses Ilimitado',
      price: 99.90,
      expiresAt,
      unlimited: true,
      txId,
      activatedAt: new Date().toISOString(),
    };

    localStorage.setItem(SUB_STORAGE_KEY, JSON.stringify(subData));

    // Sincroniza com Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert(
          {
            user_id: user.id,
            has_subscription: true,
            subscription_status: 'active',
            subscription_plan: 'Plano 6 Meses Ilimitado',
            subscription_expires_at: expiresAt,
            payment_id: txId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      }
    } catch (err) {
      console.warn('Erro opcional ao sincronizar Supabase:', err);
    }

    window.dispatchEvent(new CustomEvent('valida_subscription_updated', { detail: subData }));

    return {
      active: true,
      planName: 'Plano 6 Meses Ilimitado',
      expiresAt,
      daysRemaining: 180,
      unlimited: true,
      txId,
    };
  },

  /**
   * Inicia monitoramento via Supabase Realtime.
   * Quando o Worker atualiza `profiles.has_subscription = true`,
   * o frontend recebe a notificação em tempo real e ativa o acesso automaticamente.
   */
  subscribeToRealtimeActivation: (
    userId: string,
    onActivated: (txId: string) => void
  ): (() => void) => {
    console.log('📡 Supabase Realtime: monitorando ativação de assinatura para', userId);

    const channel = supabase
      .channel(`subscription-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const newData = payload.new as ProfileSubscriptionData & { payment_id?: string };

          if (isSubscriptionActive(newData)) {
            console.log('✅ Realtime: Assinatura ativada via Mercado Pago!', newData);
            const txId = newData.payment_id || 'MP-REALTIME-' + Date.now();
            await subscriptionService.activate6MonthsUnlimited(txId);
            onActivated(txId);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Supabase Realtime status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  },
};

