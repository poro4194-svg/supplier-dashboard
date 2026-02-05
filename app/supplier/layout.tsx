'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoading, user } = useAuth();

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!user || user.role !== 'supplier') return null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all duration-300">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
