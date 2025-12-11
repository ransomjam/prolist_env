import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Profile, UserRole } from '@/types/database';

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
  roles: UserRole[];
  primaryRole: UserRole;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  authUser: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(!isSupabaseConfigured ? false : true);

  const fetchUserProfile = async (userId: string, userEmail: string) => {
    if (!isSupabaseConfigured) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const userRoles: UserRole[] = roles?.map(r => r.role as UserRole) || ['BUYER'];
      const primaryRole = userRoles.includes('ADMIN') ? 'ADMIN' 
        : userRoles.includes('AGENT') ? 'AGENT'
        : userRoles.includes('SELLER') ? 'SELLER'
        : 'BUYER';

      setAuthUser({
        id: userId,
        email: userEmail,
        profile,
        roles: userRoles,
        primaryRole,
        isVerified: profile?.verification_status === 'VERIFIED',
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id, session.user.email || '');
          }, 0);
        } else {
          setAuthUser(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Backend not configured. Please set environment variables.') };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Backend not configured. Please set environment variables.') };
    }
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name, phone }
      }
    });

    if (!error && data.user) {
      await supabase.from('profiles').update({
        name,
        phone,
      }).eq('id', data.user.id);
    }

    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setAuthUser(null);
  };

  const refreshProfile = async () => {
    if (user && isSupabaseConfigured) {
      await fetchUserProfile(user.id, user.email || '');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      authUser,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      isConfigured: isSupabaseConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
