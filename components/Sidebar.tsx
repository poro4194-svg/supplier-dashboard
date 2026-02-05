'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, LogOut, X } from 'lucide-react';
import { Button } from './ui/Button';

export const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = user.role === 'admin' ? [
    { 
      label: 'Offers', 
      icon: Package, 
      subItems: [
        { label: 'Account Offers', path: '/admin/offers/account' },
        { label: 'Item Offers', path: '/admin/offers/item' },
        { label: 'Currency Offers', path: '/admin/offers/currency' }
      ]
    },
  ] : [
    {
      label: 'Orders',
      icon: ShoppingCart,
      subItems: [
        { label: 'Account Orders', path: '/supplier/orders/account' },
        { label: 'Item Orders', path: '/supplier/orders/item' },
        { label: 'Currency Orders', path: '/supplier/orders/currency' }
      ]
    }
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <LayoutDashboard className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-white">NexusDash</span>
        <button onClick={onClose} className="ml-auto lg:hidden text-gray-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="p-4 space-y-6">
        <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 text-gray-300 font-medium">
              <item.icon className="w-5 h-5 text-blue-500" />
              {item.label}
            </div>
            <div className="pl-10 space-y-1">
              {item.subItems.map((sub) => (
                <Link
                  key={sub.path}
                  href={sub.path}
                  onClick={onClose}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    pathname === sub.path 
                      ? 'bg-blue-600/10 text-blue-400 font-medium' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate capitalize">{user.username}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
          </div>
        </div>
        <Button variant="secondary" className="w-full justify-start text-sm" onClick={logout}>
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};
