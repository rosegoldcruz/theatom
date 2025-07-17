'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check for existing session
    const checkAuth = () => {
      try {
        // Check if user is already authenticated
        const storedUser = localStorage.getItem('atom-user');
        const authToken = localStorage.getItem('auth-token');

        if (storedUser && authToken) {
          const user = JSON.parse(storedUser);
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [mounted]);

  const signIn = async (email: string, password: string) => {
    if (!mounted) return;

    setIsLoading(true);
    try {
      // TODO: Replace with actual Supabase authentication
      // For demo purposes, create a mock user
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0]
      };

      setUser(mockUser);
      localStorage.setItem('atom-user', JSON.stringify(mockUser));
      localStorage.setItem('auth-token', 'mock-token-' + Date.now());
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!mounted) return;

    setIsLoading(true);
    try {
      // TODO: Replace with actual Supabase authentication
      // For demo purposes, create a mock user
      const mockUser: User = {
        id: '1',
        email,
        name
      };

      setUser(mockUser);
      localStorage.setItem('atom-user', JSON.stringify(mockUser));
      localStorage.setItem('auth-token', 'mock-token-' + Date.now());
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    if (!mounted) return;

    setUser(null);
    localStorage.removeItem('atom-user');
    localStorage.removeItem('auth-token');
    sessionStorage.removeItem('auth-token');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
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
