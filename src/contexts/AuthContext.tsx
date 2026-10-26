import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthError, Session } from '@supabase/supabase-js';
import { isSubscriptionActive } from '@/services/subscriptionService';
import { ocrCacheService } from '@/services/ocrCacheService';
import { API_BASE_URL } from '@/services/apiClient';

// Cadastro pelo servidor do ValidaImóvel: a conta já nasce confirmada, sem e-mail de confirmação.
// firstAccess: vindo da tela de login, só funciona para e-mails liberados pelo admin e se a conta ainda não existe.
async function createAccount(email: string, password: string, name?: string, firstAccess = false): Promise<{ ok: boolean; status: number; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, firstAccess }),
    });
    const data = await response.json().catch(() => ({})) as { error?: string };
    return { ok: response.ok, status: response.status, message: data.error };
  } catch {
    return { ok: false, status: 0, message: 'Falha de conexão. Verifique sua internet e tente novamente.' };
  }
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  hasSubscription: boolean;
  subscriptionExpiresAt: string | null;
  role: UserRole;
  name?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  isAdmin: () => boolean;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Admins: papel 'admin' no perfil ou e-mail listado em VITE_ADMIN_EMAILS — sempre após login real no Supabase
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

// Chaves do login antigo (sem senha) que não devem mais ser lidas
const LEGACY_STORAGE_KEYS = ['valida_imovel_vip_session', 'valida_imovel_approved_emails', 'valida_imovel_subscription'];

// Monta o usuário a partir da sessão do Supabase Auth e do perfil (profiles.id = id do Auth)
async function loadUser(session: Session): Promise<User> {
  const authUser = session.user;
  const email = (authUser.email || '').toLowerCase();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();
  if (error) console.warn('Aviso ao carregar perfil:', error);

  // Perfis criados no cadastro nascem sem e-mail: grava para o painel admin e o webhook de pagamento
  if (profile && !profile.email && email) {
    supabase.from('profiles').update({ email }).eq('id', authUser.id).then(({ error: e }) => {
      if (e) console.warn('Aviso ao gravar e-mail no perfil:', e);
    });
  }

  const role: UserRole = profile?.role === 'admin' || ADMIN_EMAILS.includes(email) ? 'admin' : 'user';

  return {
    id: authUser.id,
    email,
    role,
    hasSubscription: role === 'admin' || isSubscriptionActive(profile),
    subscriptionExpiresAt: profile?.subscription_expires_at ?? null,
    name: profile?.full_name || authUser.user_metadata?.full_name || email.split('@')[0],
    createdAt: profile?.created_at || authUser.created_at,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback(async (nextSession: Session | null): Promise<User | null> => {
    setSession(nextSession);
    if (!nextSession) {
      setUser(null);
      return null;
    }
    try {
      const loaded = await loadUser(nextSession);
      setUser(loaded);
      return loaded;
    } catch (err) {
      console.warn('Erro ao carregar usuário:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    LEGACY_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));

    supabase.auth.getSession()
      .then(({ data }) => applySession(data.session))
      .finally(() => setIsLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Não chamar o Supabase dentro do callback (pode travar o supabase-js): adia para o próximo ciclo
      setTimeout(() => { applySession(nextSession); }, 0);
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    let { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    // Primeiro acesso liberado pelo admin: se a conta ainda não existe, a senha digitada cria a conta (o servidor decide)
    if (error && /invalid login credentials|invalid_credentials/i.test(error.message)) {
      const firstAccess = await createAccount(cleanEmail, password, undefined, true);
      if (firstAccess.ok) ({ data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password }));
    }
    if (error) return { error };
    await applySession(data.session);
    return { error: null };
  };

  // Login com Google (provedor já ativo no Supabase). A URL de retorno precisa estar liberada em
  // Supabase → Authentication → URL Configuration → Redirect URLs.
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app` },
    });
    return { error };
  };

  // Sem confirmação por e-mail: o servidor cria a conta já confirmada e o login acontece em seguida
  const signUp = async (email: string, password: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const created = await createAccount(cleanEmail, password, name);
    if (!created.ok) {
      const message = created.status === 409 ? 'User already registered' : created.message || 'Erro ao criar conta. Tente novamente.';
      return { error: new AuthError(message, created.status || undefined) };
    }
    return signIn(cleanEmail, password);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Relatórios guardados no navegador contêm nomes e CPFs: apaga ao sair
      ocrCacheService.clearCache();
      LEGACY_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
      setUser(null);
      setSession(null);
    }
  };

  const isAdmin = () => user?.role === 'admin';

  const refreshUser = async () => {
    const { data } = await supabase.auth.getSession();
    return applySession(data.session);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        isAdmin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
