import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { isSubscriptionActive } from '@/services/subscriptionService';
import { ocrCacheService } from '@/services/ocrCacheService';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  hasSubscription: boolean;
  role: UserRole;
  name?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { error };
    await applySession(data.session);
    return { error: null };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth?tab=login`,
        data: { full_name: name || cleanEmail.split('@')[0] },
      },
    });
    if (error) return { error };

    // Com confirmação de e-mail ativa o Supabase não devolve sessão: o usuário precisa clicar no link
    if (!data.session) return { error: null, needsConfirmation: true };

    await applySession(data.session);
    return { error: null, needsConfirmation: false };
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
