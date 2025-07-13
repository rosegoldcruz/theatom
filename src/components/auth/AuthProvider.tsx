import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ngyylrygxroocpttizgo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5neXlscnlneHJvb2NwdHRpemdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMDM1NzIsImV4cCI6MjA2NzY3OTU3Mn0.Eap0yphzVPlgGW3FM5NHE01DFW-5D5ehqBEuOieu68A';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Using fallback Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'trader' | 'viewer';
  is_active: boolean;
  api_key?: string;
  max_daily_trades: number;
  max_position_size: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithGitHub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  regenerateApiKey: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;

    // Refresh profile
    await fetchUserProfile(user.id);
  };

  const regenerateApiKey = async (): Promise<string> => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .rpc('regenerate_api_key', { user_uuid: user.id });

    if (error) throw error;

    // Refresh profile to get new API key
    await fetchUserProfile(user.id);
    
    return data;
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signInWithGitHub,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    regenerateApiKey,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for checking permissions
export const usePermissions = () => {
  const { profile } = useAuth();
  
  return {
    canTrade: profile?.role === 'admin' || profile?.role === 'trader',
    canAdmin: profile?.role === 'admin',
    canView: profile?.is_active === true,
    isActive: profile?.is_active === true,
    role: profile?.role || 'viewer'
  };
};

// Hook for API key management
export const useApiKey = () => {
  const { profile, regenerateApiKey } = useAuth();
  
  return {
    apiKey: profile?.api_key,
    hasApiKey: !!profile?.api_key,
    regenerateApiKey
  };
};
