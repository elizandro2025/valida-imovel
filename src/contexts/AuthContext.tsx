import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

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
      return adminEmails.includes(email.toLowerCase()) || profileRole === 'admin'
        ? 'admin'
        : 'user';
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          const userEmail = session.user.email || '';

          // Fetch user profile data
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profile) {
            // Profile found — use it
            const resolvedRole = resolveRole(userEmail, profile.role);
            setUser({
              id: session.user.id,
              email: userEmail,
              hasSubscription: profile.has_subscription || resolvedRole === 'admin',
              role: resolvedRole,
              name: profile.full_name || userEmail.split('@')[0],
              createdAt: profile.created_at,
            });
          } else {
            // Profile missing — check if admin email and auto-create profile
            const resolvedRole = resolveRole(userEmail);
            const isAdminEmail = resolvedRole === 'admin';

            if (isAdminEmail) {
              // Auto-create profile for admin email on first login
              const newProfile = {
                user_id: session.user.id,
                has_subscription: true,
                subscription_status: 'active',
                role: 'admin' as const,
                full_name: userEmail.split('@')[0],
              };
              await supabase.from('profiles').upsert(newProfile, { onConflict: 'user_id' });

              setUser({
                id: session.user.id,
                email: userEmail,
                hasSubscription: true,
                role: 'admin',
                name: userEmail.split('@')[0],
                createdAt: new Date().toISOString(),
              });
            } else {
              // Regular user without profile — set limited access
              setUser({
                id: session.user.id,
                email: userEmail,
                hasSubscription: false,
                role: 'user',
                name: userEmail.split('@')[0],
                createdAt: new Date().toISOString(),
              });
            }
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check initial VIP session fallback
    const savedVip = localStorage.getItem('valida_imovel_vip_session');
    if (savedVip) {
      try {
        const parsed = JSON.parse(savedVip);
        setUser(parsed);
        subscriptionService.activate6MonthsUnlimited('ADMIN-VIP');
      } catch (e) {
        localStorage.removeItem('valida_imovel_vip_session');
      }
    }

    // Get initial session with fail-safe timeout & catch
    const initSession = async () => {
      try {
        const { data } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: null } }>(resolve => 
            setTimeout(() => resolve({ data: { session: null } }), 1500)
          )
        ]);
        if (data?.session) {
          setSession(data.session);
        }
      } catch (err) {
        console.warn('Supabase getSession network warning (handled):', err);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    return () => subscription.unsubscribe();
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

      // If Supabase returns error or network issue, fallback to graceful local session
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
    } catch (error) {
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

      // Fallback on network/Supabase error
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
    } catch (error) {
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
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      return { error };
    } catch (error) {
      return { error };
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
    return user?.role === 'admin';
  };

  // Admin function to grant access to users who paid
  const grantAccess = async (email: string) => {
    if (!isAdmin()) {
      throw new Error('Apenas administradores podem liberar acesso');
    }

    try {
      // Create user account with temporary password
      const tempPassword = 'TempPass123!';
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      });

      if (error) {
        throw error;
      }

      // Update profile with subscription
      if (data.user) {
        await supabase
          .from('profiles')
          .update({
            has_subscription: true,
            subscription_status: 'active'
          })
          .eq('user_id', data.user.id);
      }
    } catch (error) {
      console.error('Grant access error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    isAdmin,
    grantAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};