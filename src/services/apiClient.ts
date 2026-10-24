/**
 * Cliente da API do ValidaImóvel (Cloudflare Worker em api.validaimovel.com).
 * Rotas protegidas recebem o token da sessão do Supabase no header Authorization.
 */
import { supabase } from '@/integrations/supabase/client';

// Em produção: https://api.validaimovel.com — em dev local: http://localhost:8787
// VITE_API_BASE_URL permite gerar uma prévia apontando para a API de testes (sandbox)
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8787'
    : 'https://api.validaimovel.com');

export class SessionExpiredError extends Error {}

export const authorizedFetch = async (path: string, init: RequestInit = {}): Promise<Response> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new SessionExpiredError('Sua sessão expirou. Entre novamente na sua conta.');
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });
};
