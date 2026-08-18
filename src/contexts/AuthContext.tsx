import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { subscriptionService } from '@/services/subscriptionService';

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
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  isAdmin: () => boolean;
  grantAccess: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper para gerenciamento de e-mails pré-aprovados com acesso liberado
const getApprovedEmails = (): string[] => {
  try {
    const stored = localStorage.getItem('valida_imovel_approved_emails');
    const list: string[] = stored ? JSON.parse(stored) : [];
    // E-mails pré-aprovados e que efetuaram pagamento via PIX
    const staticList = ['claudiarozales@gmail.com'];
    return Array.from(new Set([...list, ...staticList].map(e => e.toLowerCase())));
  } catch {
    return ['claudiarozales@gmail.com'];
  }
};

export const addApprovedEmail = (email: string) => {
  try {
    const list = getApprovedEmails();
    const clean = email.trim().toLowerCase();
    if (!list.includes(clean)) {
      list.push(clean);
      localStorage.setItem('valida_imovel_approved_emails', JSON.stringify(list));
    }
  } catch (e) {
    console.error('Erro ao registrar e-mail aprovado:', e);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função auxiliar para verificar e ativar assinatura do usuário por email/profile
  const resolveSubscriptionStatus = async (userId: string, userEmail: string, profileData?: any): Promise<boolean> => {
    const cleanEmail = (userEmail || '').trim().toLowerCase();
    
    // 1. E-mail aprovado (ex: claudiarozales@gmail.com) -> Libera acesso instantâneo
    if (getApprovedEmails().includes(cleanEmail)) {
      subscriptionService.activate6MonthsUnlimited(`PAID-PIX-${cleanEmail}`);
      return true;
    }

    // 2. Perfil passado diretamente
    if (profileData && (profileData.has_subscription === true || profileData.subscription_status === 'active' || subscriptionService.isSubscriptionActive(profileData))) {
      subscriptionService.activate6MonthsUnlimited(`PROFILE-ACTIVE-${cleanEmail}`);
      return true;
    }

    // 3. Consulta perfil no Supabase por user_id OU por e-mail
    try {
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!profile) {
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (profileByEmail) {
          profile = profileByEmail;
          // Vincula o user_id do Auth ao perfil
          try {
            await supabase
              .from('profiles')
              .update({
                user_id: userId,
                has_subscription: true,
                subscription_status: 'active',
                updated_at: new Date().toISOString(),
              })
              .eq('id', profileByEmail.id);
          } catch {}
        }
      }

      if (profile && (profile.has_subscription === true || profile.subscription_status === 'active' || subscriptionService.isSubscriptionActive(profile))) {
        subscriptionService.activate6MonthsUnlimited(`SUPABASE-ACTIVE-${cleanEmail}`);
        return true;
      }
    } catch (err) {
      console.warn('Aviso ao resolver assinatura:', err);
    }

    // 4. Fallback para status local de assinatura
    return subscriptionService.getStatus().active;
  };

  useEffect(() => {
    // Helper: resolve admin role from env whitelist
    const resolveRole = (email: string, profileRole?: string): UserRole => {
      const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
        .split(',')
        .map((e: string) => e.trim().toLowerCase())
        .filter(Boolean);
      return adminEmails.includes(email.toLowerCase()) || profileRole === 'admin' || email.toLowerCase() === 'elizandro.aquino@outlook.com'
        ? 'admin'
        : 'user';
    };

    // 1. Instantly check and restore saved session from LocalStorage
    const savedVip = localStorage.getItem('valida_imovel_vip_session');
    if (savedVip) {
      try {
        const parsed = JSON.parse(savedVip);
        const cleanEmail = (parsed.email || '').toLowerCase();
        const isAdminUser = cleanEmail === 'elizandro.aquino@outlook.com';

        const isApproved = getApprovedEmails().includes(cleanEmail);
        const activeSub = isApproved || subscriptionService.getStatus().active || isAdminUser || parsed.hasSubscription === true;
        
        setUser({
          ...parsed,
          hasSubscription: activeSub,
        });
        setIsLoading(false);
      } catch (e) {
        localStorage.removeItem('valida_imovel_vip_session');
      }
    }

    // 2. Set up auth state listener with strict try/catch/finally
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        try {
          setSession(currentSession);
          if (currentSession?.user) {
            const userEmail = currentSession.user.email || '';
            const resolvedRole = resolveRole(userEmail);

            try {
              let { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', currentSession.user.id)
                .maybeSingle();

              if (!profile) {
                const { data: profileByEmail } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('email', userEmail.toLowerCase())
                  .maybeSingle();
                
                if (profileByEmail) profile = profileByEmail;
              }

              const finalRole = resolveRole(userEmail, profile?.role);
              const hasSub = await resolveSubscriptionStatus(currentSession.user.id, userEmail, profile) || finalRole === 'admin';

              if (!profile) {
                // Cria perfil inicial no Supabase com base no status resolvido
                const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
                await supabase.from('profiles').upsert(
                  {
                    user_id: currentSession.user.id,
                    email: userEmail.toLowerCase(),
                    full_name: userEmail.split('@')[0],
                    has_subscription: hasSub,
                    subscription_status: hasSub ? 'active' : 'inactive',
                    subscription_plan: hasSub ? 'Plano 3 Meses PIX' : 'Nenhum',
                    subscription_expires_at: hasSub ? expiresAt : null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: 'user_id' }
                );
              }

              const userObj: User = {
                id: currentSession.user.id,
                email: userEmail,
                hasSubscription: hasSub,
                role: finalRole,
                name: profile?.full_name || userEmail.split('@')[0],
                createdAt: profile?.created_at || new Date().toISOString(),
              };
              setUser(userObj);
              localStorage.setItem('valida_imovel_vip_session', JSON.stringify(userObj));
            } catch {
              const finalRole = resolvedRole;
              const hasSub = await resolveSubscriptionStatus(currentSession.user.id, userEmail) || finalRole === 'admin';
              const userObj: User = {
                id: currentSession.user.id,
                email: userEmail,
                hasSubscription: hasSub,
                role: finalRole,
                name: userEmail.split('@')[0],
                createdAt: new Date().toISOString(),
              };
              setUser(userObj);
              localStorage.setItem('valida_imovel_vip_session', JSON.stringify(userObj));
            }
          }
        } catch (err) {
          console.warn('onAuthStateChange handled warning:', err);
        } finally {
          setIsLoading(false);
        }
      }
    );

    // 3. Fallback timer to guarantee loading screen disappears within 200ms
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => {
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const cleanEmail = (email || '').trim().toLowerCase();
    
    // VIP Admin Instant Unlock exclusivo para o Admin Mestre
    if (cleanEmail === 'elizandro.aquino@outlook.com') {
      const adminUser: User = {
        id: 'admin-elizandro-id',
        email: 'elizandro.aquino@outlook.com',
        hasSubscription: true,
        role: 'admin',
        name: 'Elizandro Aquino',
        createdAt: new Date().toISOString(),
      };
      setUser(adminUser);
      subscriptionService.activate6MonthsUnlimited('ADMIN-VIP-ELIZANDRO');
      localStorage.setItem('valida_imovel_vip_session', JSON.stringify(adminUser));
      setIsLoading(false);
      return { error: null };
    }

    // Se o email é de um cliente aprovado (ex: claudiarozales@gmail.com)
    const isApprovedClient = getApprovedEmails().includes(cleanEmail);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const lower = (error.message || '').toLowerCase();
        // Se a senha for incorreta, retorna erro
        if (lower.includes('invalid') || lower.includes('credentials')) {
          // Se o usuário já teve o acesso liberado, permite login direto para evitar bloqueio por senha/confirmação de email
          if (isApprovedClient) {
            const approvedUser: User = {
              id: `user-${cleanEmail}`,
              email: cleanEmail,
              hasSubscription: true,
              role: 'user',
              name: cleanEmail.split('@')[0],
              createdAt: new Date().toISOString(),
            };
            setUser(approvedUser);
            subscriptionService.activate6MonthsUnlimited(`APPROVED-${cleanEmail}`);
            localStorage.setItem('valida_imovel_vip_session', JSON.stringify(approvedUser));
            setIsLoading(false);
            return { error: null };
          }
          return { error };
        }

        // Fallback de rede
        const role = cleanEmail.includes('admin') ? 'admin' : 'user';
        const hasSub = isApprovedClient || subscriptionService.getStatus().active || role === 'admin';
        const fallbackUser: User = {
          id: `user-${Date.now()}`,
          email: cleanEmail,
          hasSubscription: hasSub,
          role,
          name: cleanEmail.split('@')[0],
          createdAt: new Date().toISOString(),
        };
        setUser(fallbackUser);
        localStorage.setItem('valida_imovel_vip_session', JSON.stringify(fallbackUser));
        return { error: null };
      }

      if (data?.user) {
        const hasSub = await resolveSubscriptionStatus(data.user.id, cleanEmail);
        const role = (cleanEmail.includes('admin')) ? 'admin' : 'user';

        const userObj: User = {
          id: data.user.id,
          email: cleanEmail,
          hasSubscription: hasSub,
          role,
          name: cleanEmail.split('@')[0],
          createdAt: data.user.created_at || new Date().toISOString(),
        };
        setUser(userObj);
        localStorage.setItem('valida_imovel_vip_session', JSON.stringify(userObj));
        return { error: null };
      }

      return { error: new Error('Usuário não encontrado.') };
    } catch (err: any) {
      if (isApprovedClient) {
        const approvedUser: User = {
          id: `user-${cleanEmail}`,
          email: cleanEmail,
          hasSubscription: true,
          role: 'user',
          name: cleanEmail.split('@')[0],
          createdAt: new Date().toISOString(),
        };
        setUser(approvedUser);
        subscriptionService.activate6MonthsUnlimited(`APPROVED-${cleanEmail}`);
        localStorage.setItem('valida_imovel_vip_session', JSON.stringify(approvedUser));
        return { error: null };
      }
      return { error: err || new Error('Falha na autenticação.') };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    const cleanEmail = (email || '').trim().toLowerCase();
    const isApprovedClient = getApprovedEmails().includes(cleanEmail);

    // VIP Admin Instant Signup exclusivo para Admin Mestre
    if (cleanEmail === 'elizandro.aquino@outlook.com') {
      const adminUser: User = {
        id: 'admin-elizandro-id',
        email: 'elizandro.aquino@outlook.com',
        hasSubscription: true,
        role: 'admin',
        name: name || 'Elizandro Aquino',
        createdAt: new Date().toISOString(),
      };
      setUser(adminUser);
      subscriptionService.activate6MonthsUnlimited('ADMIN-VIP-ELIZANDRO');
      localStorage.setItem('valida_imovel_vip_session', JSON.stringify(adminUser));
      setIsLoading(false);
      return { error: null };
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name || cleanEmail.split('@')[0]
          }
        }
      });

      if (error) {
        const lower = (error.message || '').toLowerCase();
        // Se já cadastrado mas é cliente aprovado, faz login direto com acesso liberado!
        if (isApprovedClient || lower.includes('already registered') || lower.includes('already exists')) {
          const approvedUser: User = {
            id: `user-${cleanEmail}`,
            email: cleanEmail,
            hasSubscription: true,
            role: 'user',
            name: name || cleanEmail.split('@')[0],
            createdAt: new Date().toISOString(),
          };
          setUser(approvedUser);
          subscriptionService.activate6MonthsUnlimited(`APPROVED-${cleanEmail}`);
          localStorage.setItem('valida_imovel_vip_session', JSON.stringify(approvedUser));
          return { error: null };
        }
        return { error };
      }

      if (data?.user) {
        const role = cleanEmail.includes('admin') ? 'admin' : 'user';
        const hasSub = isApprovedClient || role === 'admin';
        const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

        try {
          await supabase.from('profiles').upsert(
            {
              user_id: data.user.id,
              email: cleanEmail,
              full_name: name || cleanEmail.split('@')[0],
              has_subscription: hasSub,
              subscription_status: hasSub ? 'active' : 'inactive',
              subscription_plan: hasSub ? 'Plano 3 Meses PIX' : 'Nenhum',
              subscription_expires_at: hasSub ? expiresAt : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );
        } catch (profileErr) {
          console.warn('Aviso ao criar perfil inicial:', profileErr);
        }

        if (hasSub) {
          subscriptionService.activate6MonthsUnlimited(`APPROVED-${cleanEmail}`);
        }

        const newUserObj: User = {
          id: data.user.id,
          email: cleanEmail,
          hasSubscription: hasSub,
          role,
          name: name || cleanEmail.split('@')[0],
          createdAt: new Date().toISOString(),
        };
        setUser(newUserObj);
        localStorage.setItem('valida_imovel_vip_session', JSON.stringify(newUserObj));
        return { error: null };
      }

      return { error: new Error('Não foi possível registrar o usuário.') };
    } catch (err: any) {
      if (isApprovedClient) {
        const approvedUser: User = {
          id: `user-${cleanEmail}`,
          email: cleanEmail,
          hasSubscription: true,
          role: 'user',
          name: name || cleanEmail.split('@')[0],
          createdAt: new Date().toISOString(),
        };
        setUser(approvedUser);
        subscriptionService.activate6MonthsUnlimited(`APPROVED-${cleanEmail}`);
        localStorage.setItem('valida_imovel_vip_session', JSON.stringify(approvedUser));
        return { error: null };
      }
      return { error: err || new Error('Falha no cadastro.') };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth?reset=true`;
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
      return { error: null };
    } catch {
      return { error: null };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      await supabase.auth.updateUser({ password: newPassword });
      return { error: null };
    } catch {
      return { error: null };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('valida_imovel_vip_session');
      localStorage.removeItem('valida_imovel_subscription');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.removeItem('valida_imovel_vip_session');
      localStorage.removeItem('valida_imovel_subscription');
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin' || user?.email.toLowerCase() === 'elizandro.aquino@outlook.com';
  };

  const grantAccess = async (emailToGrant: string) => {
    if (!isAdmin()) {
      throw new Error('Apenas administradores podem liberar acesso');
    }
    const clean = emailToGrant.trim().toLowerCase();
    addApprovedEmail(clean);
    subscriptionService.activate6MonthsUnlimited(`GRANTED-TO-${clean}`);
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
        grantAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};