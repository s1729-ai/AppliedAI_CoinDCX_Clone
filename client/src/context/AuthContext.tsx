import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { IUser } from '../types';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  demoLogin: () => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('coindcx_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('coindcx_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/profile');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (e) {
      console.warn('Failed to load profile, clearing token');
      localStorage.removeItem('coindcx_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('coindcx_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        localStorage.setItem('coindcx_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const demoLogin = async (): Promise<boolean> => {
    try {
      const res = await api.post('/auth/demo-login');
      if (res.data.success) {
        localStorage.setItem('coindcx_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Demo login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('coindcx_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
