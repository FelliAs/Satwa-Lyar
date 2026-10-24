'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  UNAUTHORIZED_EVENT,
  authApi,
  getStoredUser,
  getToken,
  removeToken,
  setStoredUser,
  setToken,
} from '@/lib/api';
import type { AdminUser } from '@/lib/types';

interface AuthContextValue {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const isAdminUser = (user: AdminUser | null | undefined): boolean =>
  !!user && (user.is_admin === 1 || user.is_admin === true || user.role === 'admin');

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    removeToken();
    setUser(null);
    setTokenState(null);
  }, []);

  // Verifikasi sesi saat aplikasi dimuat.
  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      setTokenState(storedToken);
      setUser(getStoredUser());

      try {
        const res = await authApi.me();
        if (cancelled) return;

        if (isAdminUser(res.data)) {
          setUser(res.data);
          setStoredUser(res.data);
        } else {
          clearSession();
        }
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void initAuth();

    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // Backend menolak sesi (401/403) pada request apa pun → paksa logout.
  useEffect(() => {
    const handleUnauthorized = () => clearSession();
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { token: newToken, user: newUser } = res.data;

    if (!isAdminUser(newUser)) {
      throw new Error('Akses ditolak. Hanya akun admin yang dapat masuk ke panel ini.');
    }

    setToken(newToken);
    setStoredUser(newUser);
    setTokenState(newToken);
    setUser(newUser);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authApi.register(name, email, password);
    return {
      success: res.success,
      message: res.message || 'Registrasi berhasil! Silakan masuk dengan akun Anda.',
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout di backend bersifat best-effort; sesi lokal tetap dibersihkan.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user && !!token && isAdminUser(user),
      isAdmin: isAdminUser(user),
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
