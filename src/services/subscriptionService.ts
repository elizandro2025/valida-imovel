/**
 * Subscription Service — ValidaImóvel
 *
 * A assinatura vale somente o que está no Supabase (profiles), gravado pelo webhook de pagamento
 * no servidor. O navegador apenas lê e acompanha a ativação em tempo real.
 */
import { supabase } from '@/integrations/supabase/client';

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
  const notExpired = profile.subscription_expires_at
    ? new Date(profile.subscription_expires_at).getTime() > Date.now()
    : true;
  return (hasSub || isStatusActive) && notExpired;
};

export const subscriptionService = {
  isSubscriptionActive,

  /**
   * Acompanha via Supabase Realtime a ativação feita pelo webhook de pagamento.
   * Quando o perfil passa a ter assinatura válida, chama onActivated.
   */
  subscribeToRealtimeActivation: (
    userId: string,
    onActivated: (paymentId: string) => void
  ): (() => void) => {
    const channel = supabase
      .channel(`subscription-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`, // profiles.id é o id do usuário no Supabase Auth
        },
        (payload) => {
          const newData = payload.new as ProfileSubscriptionData & { payment_id?: string };
          if (isSubscriptionActive(newData)) {
            console.log('✅ Realtime: Assinatura ativada via webhook de pagamento!');
            onActivated(newData.payment_id || '');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
