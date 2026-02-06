'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 1. Load user from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // 2. Protect Routes
  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname === '/login';
    const isRootPage = pathname === '/';

    // CASE A: User is NOT logged in
    if (!user) {
      // If they are on a protected page (not login), send them to login
      if (!isAuthPage) {
        router.replace('/login');
      }
      return; // Stop execution here
    }

    // CASE B: User IS logged in
    const adminHome = '/admin/offers/account';
    const supplierHome = '/supplier/orders/account';
    const targetHome = user.role === 'admin' ? adminHome : supplierHome;

    // 1. Redirect from Public pages (Login/Root) to Dashboard
    if (isAuthPage || isRootPage) {
      // We don't need to check "if (pathname !== home)" because we know 
      // pathname is currently '/login' or '/', so it definitely isn't home.
      router.replace(targetHome);
      return;
    }

    // 2. Role-based Protection (prevent cross-role access)
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
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    router.replace(userData.role === 'admin' ? '/admin/offers/account' : '/supplier/orders/account');
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