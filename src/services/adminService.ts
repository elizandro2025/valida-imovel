/**
 * Admin Service — operações do painel admin feitas pela API (o servidor confere se o usuário é admin).
 */
import { authorizedFetch } from './apiClient';

export interface AdminUser {
  id: string;
  email: string | null;
  full_name?: string | null;
  role?: string | null;
  has_subscription?: boolean | null;
  subscription_status?: string | null;
  subscription_plan?: string | null;
  subscription_expires_at?: string | null;
  created_at?: string | null;
}

export interface UnlinkedPayment {
  payment_id: string;
  customer_email: string | null;
  value: number;
  paid_at: string | null;
  created_at: string;
}

// Números reais vindos de /api/admin/metrics (null = tabela ainda não criada no banco)
export interface AdminMetrics {
  environment: string;
  tables_ready: boolean;
  analyses: { today: number; last_7_days: number; last_30_days: number; active_users_7_days: number } | null;
  ai_last_24h: { calls: number; failures: number; models: Record<string, number> } | null;
  payments_last_30_days: { count: number; revenue: number; refunds: number } | null;
  unlinked_payments: UnlinkedPayment[];
  active_subscribers: number | null;
  services: { database: boolean; ai_key_configured: boolean; payments_key_configured: boolean };
}

const readJson = async <T>(response: Response): Promise<T> => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((body as { error?: string }).error || `Erro ${response.status} na API`);
  }
  return body as T;
};

export const adminService = {
  listUsers: async (): Promise<AdminUser[]> => {
    const result = await readJson<{ users: AdminUser[] }>(await authorizedFetch('/api/admin/users'));
    return result.users;
  },

  metrics: (): Promise<AdminMetrics> => authorizedFetch('/api/admin/metrics').then(r => readJson<AdminMetrics>(r)),

  // Libera (+90 dias, somando ao que restar) ou revoga a assinatura, por id ou e-mail.
  // Com payment_id, também vincula ao usuário um pagamento que chegou sem conta.
  setSubscription: async (target: { id?: string; email?: string; payment_id?: string }, active: boolean): Promise<AdminUser> => {
    const result = await readJson<{ user: AdminUser }>(
      await authorizedFetch('/api/admin/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...target, active }),
      })
    );
    return result.user;
  },
};
