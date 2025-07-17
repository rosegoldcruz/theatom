import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('atom_token');
    const storedUser = localStorage.getItem('atom_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        
        // Set default axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('atom_token');
        localStorage.removeItem('atom_user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        
        setToken(newToken);
        setUser(newUser);
        
        // Store in localStorage
        localStorage.setItem('atom_token', newToken);
        localStorage.setItem('atom_user', JSON.stringify(newUser));
        
        // Set default axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        return { success: true };
      } else {
        return { success: false, error: response.data.error || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Network error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    confirmPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        confirmPassword
      });

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        
        setToken(newToken);
        setUser(newUser);
        
        // Store in localStorage
        localStorage.setItem('atom_token', newToken);
        localStorage.setItem('atom_user', JSON.stringify(newUser));
        
        // Set default axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        return { success: true };
      } else {
        return { success: false, error: response.data.error || 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Network error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('atom_token');
    localStorage.removeItem('atom_user');
    
    // Clear axios header
    delete axios.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Axios interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('atom_token');
      localStorage.removeItem('atom_user');
      delete axios.defaults.headers.common['Authorization'];
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
