'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppData } from '@/context/AppDataContext';
import type { OfferCategory, OrderStatus, SupplierId } from '@/types';
import { SUPPLIERS } from '@/types';
import { DateRangePicker, type DateRange } from '@/components/DateRangePicker';

const CATEGORIES: OfferCategory[] = ['account', 'item', 'currency'];
const STATUSES: OrderStatus[] = ['Pending', 'Active', 'Processing', 'Completed'];

function parseMoney(price: string) {
  const n = Number(price.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function formatDate(ts?: number) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString();
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function endOfDay(ts: number) {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
}

export default function AdminOrdersPage() {
  const { orders } = useAppData();

  const [category, setCategory] = useState<OfferCategory | 'all'>('all');
  const [supplierId, setSupplierId] = useState<SupplierId | 'all'>('all');
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');

  // ✅ clean date range (default: last 2 weeks)
  const [range, setRange] = useState<DateRange>(() => {
    const now = Date.now();
    return {
      from: startOfDay(now - 13 * 24 * 60 * 60 * 1000),
      to: endOfDay(now),
    };
  });

  // 1) date range
  const inRange = useMemo(() => {
    return orders.filter(o => {
      const ts = o.createdAt ?? 0;
      return ts >= range.from && ts <= range.to;
    });
  }, [orders, range]);

  // 2) other filters
  const filtered = useMemo(() => {
    return inRange.filter(o => {
      const okCategory = category === 'all' ? true : o.category === category;
      const okSupplier = supplierId === 'all' ? true : o.supplierId === supplierId;
      const okStatus = status === 'all' ? true : o.status === status;
      return okCategory && okSupplier && okStatus;
    });
  }, [inRange, category, supplierId, status]);

  const stats = useMemo(() => {
    const totalOrders = filtered.length;
    const pending = filtered.filter(o => o.status === 'Pending').length;
    const active = filtered.filter(o => o.status === 'Active').length;
    const processing = filtered.filter(o => o.status === 'Processing').length;
    const completed = filtered.filter(o => o.status === 'Completed').length;

    const completedRevenue = filtered
      .filter(o => o.status === 'Completed')
      .reduce((sum, o) => sum + parseMoney(o.price) * (o.qty ?? 1), 0);

    return { totalOrders, pending, active, processing, completed, completedRevenue };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Orders</h2>
          <p className="text-gray-400 text-sm mt-1">All supplier orders in one place (read-only)</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <DateRangePicker value={range} onChange={setRange} />
          <div className="text-xs text-blue-200/70 bg-blue-900/20 border border-blue-500/20 rounded-full px-4 py-2 w-fit">
            Analytics are based on CET timezone
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-gray-900 border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500"
            >
              <option value="all">All</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Supplier</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500"
            >
              <option value="all">All</option>
              {SUPPLIERS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500"
            >
              <option value="all">All</option>
              {STATUSES.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="w-full text-right">
              <div className="text-xs text-gray-400">Completed revenue</div>
              <div className="text-xl font-bold text-white">${stats.completedRevenue.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 border border-gray-800 bg-gray-900">
          <div className="text-xs text-gray-400">Total</div>
          <div className="text-lg font-bold text-white">{stats.totalOrders}</div>
        </Card>
        <Card className="p-3 border border-gray-800 bg-gray-900">
          <div className="text-xs text-gray-400">Pending</div>
          <div className="text-lg font-bold text-white">{stats.pending}</div>
        </Card>
        <Card className="p-3 border border-gray-800 bg-gray-900">
          <div className="text-xs text-gray-400">Active</div>
          <div className="text-lg font-bold text-white">{stats.active}</div>
        </Card>
        <Card className="p-3 border border-gray-800 bg-gray-900">
          <div className="text-xs text-gray-400">Processing</div>
          <div className="text-lg font-bold text-white">{stats.processing}</div>
        </Card>
        <Card className="p-3 border border-gray-800 bg-gray-900">
          <div className="text-xs text-gray-400">Completed</div>
          <div className="text-lg font-bold text-white">{stats.completed}</div>
        </Card>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800/50 text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Game</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-gray-300">{formatDate(row.createdAt)}</td>
                  <td className="px-6 py-4 text-gray-300">{row.supplierId}</td>
                  <td className="px-6 py-4 text-gray-300">{row.category}</td>
                  <td className="px-6 py-4 text-gray-300">{row.game}</td>
                  <td className="px-6 py-4 text-gray-300">{row.product}</td>
                  <td className="px-6 py-4 text-gray-300">{row.qty}</td>
                  <td className="px-6 py-4 text-gray-300">{row.price}</td>
                  <td className="px-6 py-4 text-gray-300">
                    <Badge status={row.status} />
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td className="px-6 py-10 text-gray-500" colSpan={8}>
                    No orders match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
