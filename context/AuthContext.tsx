'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUser(raw: any): User | null {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.username !== 'string') return null;
  if (raw.role !== 'admin' && raw.role !== 'supplier') return null;

  // Ako je supplier, a nema supplierId (stari storage), koristimo username kao supplierId.
  // (Ovo je OK za sada jer ćeš ti napraviti logine tipa: ffin, sup2, sup3)
  if (raw.role === 'supplier') {
    return {
      username: raw.username,
      role: 'supplier',
      supplierId: raw.supplierId ?? raw.username,
    } as User;
  }

  // admin
  return {
    username: raw.username,
    role: 'admin',
  } as User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 1) Load user from localStorage on mount (+ normalize)
  useEffect(() => {
    const initAuth = () => {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          const normalized = normalizeUser(parsed);

          if (normalized) {
            // upiši nazad normalizovan user (da sledeći put bude čist)
            localStorage.setItem('user', JSON.stringify(normalized));
            setUser(normalized);
          } else {
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 2) Protect Routes
  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname === '/login';
    const isRootPage = pathname === '/';

    // CASE A: User is NOT logged in
    if (!user) {
      if (!isAuthPage) router.replace('/login');
      return;
    }

    // CASE B: User IS logged in
    const adminHome = '/admin/offers/account';
    const supplierHome = '/supplier/orders/account';
    const targetHome = user.role === 'admin' ? adminHome : supplierHome;

    // Redirect from Public pages (Login/Root) to Dashboard
    if (isAuthPage || isRootPage) {
      router.replace(targetHome);
      return;
    }

    // Role-based Protection
    if (user.role === 'admin' && pathname.startsWith('/supplier')) {
      router.replace(adminHome);
      return;
    }

    if (user.role === 'supplier' && pathname.startsWith('/admin')) {
      router.replace(supplierHome);
      return;
    }
  }, [user, isLoading, pathname, router]);

  const login = (userData: User) => {
    // normalize i na login (da ne upadne supplier bez supplierId)
    const normalized = normalizeUser(userData) ?? userData;

    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);

    router.replace(normalized.role === 'admin' ? '/admin/offers/account' : '/supplier/orders/account');
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
