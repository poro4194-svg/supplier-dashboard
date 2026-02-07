'use client';

import React, { useState } from 'react';
import { LayoutDashboard, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import type { SupplierId } from '@/types';

export default function LoginPage() {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      // ✅ Admin
      if (username === 'admin' && password === 'admin') {
        login({ username: 'admin', role: 'admin' });
        return;
      }

      // ✅ Suppliers (3 komada)
      const suppliers: SupplierId[] = ['ffin', 'sup2', 'sup3'];

      if (suppliers.includes(username as SupplierId) && password === username) {
        const id = username as SupplierId;
        login({ username: id, role: 'supplier', supplierId: id });
        return;
      }

      setError('Invalid credentials');
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#26272B] flex flex-col justify-center items-center pt-32 pb-20 animate-fade-in px-4">
      <div className="bg-[#2D2E33] border border-[#404249] rounded-2xl p-12 max-w-lg w-full shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#5A96F7] rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-[36px] font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-[#C7D6F3] text-[18px]">Sign in to your PoroGold account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[16px] font-medium text-[#C7D6F3] mb-3">Username</label>
            <input
              required
              type="text"
              className="w-full bg-[#26272B] border border-[#404249] rounded-xl p-5 text-white focus:ring-1 focus:ring-[#5A96F7] focus:border-[#5A96F7] outline-none transition-all placeholder:text-[#6B7280]"
              placeholder="admin / ffin / sup2 / sup3"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-[16px] font-medium text-[#C7D6F3]">Password</label>
              <button type="button" className="text-sm text-[#5A96F7] hover:text-white transition-colors">
                Forgot?
              </button>
            </div>
            <input
              required
              type="password"
              className="w-full bg-[#26272B] border border-[#404249] rounded-xl p-5 text-white focus:ring-1 focus:ring-[#5A96F7] focus:border-[#5A96F7] outline-none transition-all placeholder:text-[#6B7280]"
              placeholder="same as username"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-[14px] text-red-300">
              <ShieldAlert className="w-4 h-4" />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full py-5 text-[18px]" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-10 text-center text-[14px] text-[#9CA3AF]">
          Quick logins:{' '}
          <span className="text-[#C7D6F3]">admin/admin</span> · <span className="text-[#C7D6F3]">ffin/ffin</span> ·{' '}
          <span className="text-[#C7D6F3]">sup2/sup2</span> · <span className="text-[#C7D6F3]">sup3/sup3</span>
        </div>
      </div>
    </div>
  );
}
