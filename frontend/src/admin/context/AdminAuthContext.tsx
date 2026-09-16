import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  adminAuthApi,
  getAdminToken,
  setAdminToken,
  removeAdminToken,
} from '../services/adminApiClient';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
  lastLoginAt?: string;
  createdAt?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const savedUser = localStorage.getItem('vexo_admin_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(getAdminToken);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const savedToken = getAdminToken();
    const savedUser = localStorage.getItem('vexo_admin_user');
    return !savedToken || !savedUser;
  });

  const refreshProfile = useCallback(async () => {
    const currentToken = getAdminToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await adminAuthApi.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('vexo_admin_user', JSON.stringify(response.data));
      }
    } catch {
      const saved = localStorage.getItem('vexo_admin_user');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          removeAdminToken();
          localStorage.removeItem('vexo_admin_user');
          setUser(null);
          setToken(null);
        }
      } else {
        removeAdminToken();
        localStorage.removeItem('vexo_admin_user');
        setUser(null);
        setToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await adminAuthApi.login(credentials);
      if (response.success && response.data) {
        const { token: newToken, user: newUser } = response.data;
        setAdminToken(newToken);
        localStorage.setItem('vexo_admin_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message || 'Login failed.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login error occurred.' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await adminAuthApi.logout().catch(() => {});
      }
    } finally {
      removeAdminToken();
      localStorage.removeItem('vexo_admin_user');
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
