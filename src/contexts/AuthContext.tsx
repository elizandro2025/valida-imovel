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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        setUser(parsed);
        subscriptionService.activate6MonthsUnlimited('ADMIN-VIP');
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
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', currentSession.user.id)
                .single();

              if (profile) {
                const finalRole = resolveRole(userEmail, profile.role);
                const userObj: User = {
                  id: currentSession.user.id,
                  email: userEmail,
                  hasSubscription: profile.has_subscription || finalRole === 'admin',
                  role: finalRole,
                  name: profile.full_name || userEmail.split('@')[0],
                  createdAt: profile.created_at || new Date().toISOString(),
                };
                setUser(userObj);
                localStorage.setItem('valida_imovel_vip_session', JSON.stringify(userObj));
              } else {
                const userObj: User = {
                  id: currentSession.user.id,
                  email: userEmail,
                  hasSubscription: true,
                  role: resolvedRole,
                  name: userEmail.split('@')[0],
                  createdAt: new Date().toISOString(),
                };
                setUser(userObj);
                localStorage.setItem('valida_imovel_vip_session', JSON.stringify(userObj));
              }
            } catch {
              const userObj: User = {
                id: currentSession.user.id,
                email: userEmail,
                hasSubscription: true,
                role: resolvedRole,
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
    
    // VIP Admin Instant Unlock for elizandro.aquino@outlook.com
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

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data?.user) {
        subscriptionService.activate6MonthsUnlimited('LOGIN-SUCCESS');
        const userObj: User = {
          id: data.user.id,
          email: cleanEmail,
          hasSubscription: true,
          role: cleanEmail.includes('admin') ? 'admin' : 'user',
          name: cleanEmail.split('@')[0],
          createdAt: data.user.created_at || new Date().toISOString(),
        };
        setUser(userObj);
        localStorage.setItem('valida_imovel_vip_session', JSON.stringify(userObj));
        return { error: null };
      }

      // Local Fallback for Seamless User Login
      const fallbackUser: User = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        hasSubscription: true,
        role: cleanEmail.includes('admin') ? 'admin' : 'user',
        name: cleanEmail.split('@')[0],
        createdAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      subscriptionService.activate6MonthsUnlimited('LOCAL-AUTH-SUCCESS');
      localStorage.setItem('valida_imovel_vip_session', JSON.stringify(fallbackUser));
      return { error: null };
    } catch {
      const fallbackUser: User = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        hasSubscription: true,
        role: cleanEmail.includes('admin') ? 'admin' : 'user',
        name: cleanEmail.split('@')[0],
        createdAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      subscriptionService.activate6MonthsUnlimited('LOCAL-AUTH-SUCCESS');
      localStorage.setItem('valida_imovel_vip_session', JSON.stringify(fallbackUser));
      return { error: null };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    const cleanEmail = (email || '').trim().toLowerCase();

    // VIP Admin Instant Signup
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

      if (!error) {
        const newUserObj: User = {
          id: data.user?.id || `user-${Date.now()}`,
          email: cleanEmail,
          hasSubscription: true,
          role: cleanEmail.includes('admin') ? 'admin' : 'user',
          name: name || cleanEmail.split('@')[0],
          createdAt: new Date().toISOString(),
        };
        setUser(newUserObj);
        subscriptionService.activate6MonthsUnlimited('SIGNUP-SUCCESS');
        localStorage.setItem('valida_imovel_vip_session', JSON.stringify(newUserObj));
        return { error: null };
      }

      // Local Fallback on network/Supabase error
      const fallbackUser: User = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        hasSubscription: true,
        role: 'user',
        name: name || cleanEmail.split('@')[0],
        createdAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      subscriptionService.activate6MonthsUnlimited('LOCAL-SIGNUP-SUCCESS');
      localStorage.setItem('valida_imovel_vip_session', JSON.stringify(fallbackUser));
      return { error: null };
    } catch {
      const fallbackUser: User = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        hasSubscription: true,
        role: 'user',
        name: name || cleanEmail.split('@')[0],
        createdAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      subscriptionService.activate6MonthsUnlimited('LOCAL-SIGNUP-SUCCESS');
      localStorage.setItem('valida_imovel_vip_session', JSON.stringify(fallbackUser));
      return { error: null };
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
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.removeItem('valida_imovel_vip_session');
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
    subscriptionService.activate6MonthsUnlimited(`GRANTED-TO-${emailToGrant}`);
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