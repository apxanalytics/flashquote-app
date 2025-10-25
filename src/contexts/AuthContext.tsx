import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase, ContractorProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: ContractorProfile | null;
  loading: boolean;
  isInstalled: boolean;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  signUp: (email: string, password: string, metadata: {
    business_name: string;
    owner_name: string;
    phone_number: string;
  }) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  signOutAllDevices: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<ContractorProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('contractor_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const standaloneNav = (window.navigator as any).standalone === true;
    setIsInstalled(standalone || standaloneNav);

    const storedRememberMe = localStorage.getItem('rememberMe');
    if (storedRememberMe !== null) {
      setRememberMe(storedRememberMe === 'true');
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        localStorage.setItem('lastUserId', session.user.id);
        localStorage.setItem('lastUserEmail', session.user.email || '');
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        localStorage.setItem('lastUserId', session.user.id);
        localStorage.setItem('lastUserEmail', session.user.email || '');
        localStorage.setItem('lastLoginTime', Date.now().toString());
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: {
    business_name: string;
    owner_name: string;
    phone_number: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { error };
      if (!data.user) return { error: new Error('User creation failed') as AuthError };

      const { error: profileError } = await supabase
        .from('contractor_profiles')
        .insert({
          id: data.user.id,
          business_name: metadata.business_name,
          owner_name: metadata.owner_name,
          phone_number: metadata.phone_number,
          onboarding_completed: false,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string, remember: boolean = true) => {
    localStorage.setItem('rememberMe', remember.toString());
    setRememberMe(remember);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      localStorage.setItem('lastLoginTime', Date.now().toString());
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    localStorage.removeItem('lastLoginTime');
  };

  const signOutAllDevices = async () => {
    await supabase.auth.signOut({ scope: 'global' });
    setProfile(null);
    localStorage.removeItem('lastLoginTime');
    localStorage.removeItem('lastUserId');
    localStorage.removeItem('lastUserEmail');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updateProfile = async (updates: Partial<ContractorProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('contractor_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    profile,
    loading,
    isInstalled,
    rememberMe,
    setRememberMe,
    signUp,
    signIn,
    signOut,
    signOutAllDevices,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
