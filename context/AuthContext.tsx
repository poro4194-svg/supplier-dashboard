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

  useEffect(() => {
    // Check local storage on mount
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname === '/login';
    
    if (!user && !isAuthPage) {
      router.push('/login');
    }

    if (user) {
      if (isAuthPage || pathname === '/') {
        router.push(user.role === 'admin' ? '/admin/offers/account' : '/supplier/orders/account');
      }
      
      // Role protection
      if (user.role === 'admin' && pathname.startsWith('/supplier')) {
        router.push('/admin/offers/account');
      }
      if (user.role === 'supplier' && pathname.startsWith('/admin')) {
        router.push('/supplier/orders/account');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    router.push(userData.role === 'admin' ? '/admin/offers/account' : '/supplier/orders/account');
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
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
