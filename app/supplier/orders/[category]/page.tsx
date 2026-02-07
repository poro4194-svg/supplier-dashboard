'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import type { OfferCategory, OrderStatus } from '@/types';

export default function SupplierOrdersPage() {
  const params = useParams();
  const raw = params.category;
  const category = (Array.isArray(raw) ? raw[0] : raw) as OfferCategory;
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  const { user } = useAuth();
  const { orders, updateOrderStatus } = useAppData();

  const supplierId = user?.role === 'supplier' ? user.supplierId : undefined;

  const filteredOrders = useMemo(() => {
    if (!supplierId) return [];
    return orders.filter(o => o.category === category && o.supplierId === supplierId);
  }, [orders, category, supplierId]);

  const nextActions = (status: OrderStatus) => {
    // Minimalni workflow:
    // Pending -> Active -> Processing -> Completed
    if (status === 'Pending') return [{ label: 'Accept', to: 'Active' as const }];
    if (status === 'Active') return [{ label: 'Start processing', to: 'Processing' as const }];
    if (status === 'Processing') return [{ label: 'Complete', to: 'Completed' as const }];
    return []; // Completed nema akcije
  };

  const pendingCount = filteredOrders.filter(o => o.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{formattedCategory} Orders</h2>
          <p className="text-gray-400 text-sm mt-1">
            Track incoming orders and fulfillment status
            {supplierId ? <span className="text-gray-500"> • Supplier: {supplierId}</span> : null}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-sm">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Minimal "new order" box - sada realno pokazuje koliko Pending imaš */}
      {pendingCount > 0 && (
        <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg flex items-start gap-3">
          <div className="p-1 bg-blue-500 rounded-full mt-0.5">
            <Bell className="w-3 h-3 text-white" />
          </div>
          <div>
            <h4 className="text-blue-400 font-medium text-sm">New Order Request</h4>
            <p className="text-blue-200/60 text-xs mt-1">
              You have {pendingCount} pending order{pendingCount === 1 ? '' : 's'}. Accept to start working.
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800/50 text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">Game</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredOrders.map((row) => {
                const actions = nextActions(row.status);

                return (
                  <tr key={row.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-gray-300">{row.game}</td>
                    <td className="px-6 py-4 text-gray-300">{row.product}</td>
                    <td className="px-6 py-4 text-gray-300">{row.qty}</td>
                    <td className="px-6 py-4 text-gray-300">{row.price}</td>
                    <td className="px-6 py-4 text-gray-300">
                      <Badge status={row.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {actions.map(a => (
                          <Button
                            key={a.to}
                            variant="outline"
                            className="text-xs"
                            onClick={() => updateOrderStatus(row.id, a.to)}
                          >
                            {a.label}
                          </Button>
                        ))}
                        {actions.length === 0 && (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td className="px-6 py-10 text-gray-500" colSpan={6}>
                    No orders for you in this category.
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