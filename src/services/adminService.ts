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

  // Libera (90 dias) ou revoga a assinatura de um usuário, por id ou e-mail
  setSubscription: async (target: { id?: string; email?: string }, active: boolean): Promise<AdminUser> => {
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
