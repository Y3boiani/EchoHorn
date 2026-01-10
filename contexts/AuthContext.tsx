'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User, AuthResponse, LoginData, RegisterData } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('echohorn_token');
      if (token) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token invalid, clear it
          localStorage.removeItem('echohorn_token');
          localStorage.removeItem('echohorn_user');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.login(data);
    localStorage.setItem('echohorn_token', response.token);
    localStorage.setItem('echohorn_user', JSON.stringify(response.user));
    setUser(response.user);
    return response;
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.register(data);
    localStorage.setItem('echohorn_token', response.token);
    localStorage.setItem('echohorn_user', JSON.stringify(response.user));
    setUser(response.user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('echohorn_token');
    localStorage.removeItem('echohorn_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
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
