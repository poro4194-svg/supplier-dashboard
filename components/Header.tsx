'use client';

import React from 'react';
import { Menu, Search, Bell, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const pathname = usePathname();
  
  return (
    <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40 flex items-center justify-between px-6">
      <button onClick={onMenuClick} className="lg:hidden text-gray-400 hover:text-white">
        <Menu className="w-6 h-6" />
      </button>
      
      <div className="hidden md:flex items-center gap-4 text-gray-400 text-sm">
        <span className="hover:text-white cursor-pointer transition-colors">Dashboard</span>
        <ChevronRight className="w-4 h-4 text-gray-600" />
        <span className="text-white font-medium capitalize">
          {pathname.split('/').filter(Boolean).slice(1).join(' / ')}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-gray-800 border border-gray-700 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none w-64"
          />
        </div>
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-gray-900"></span>
        </button>
      </div>
    </header>
  );
};
