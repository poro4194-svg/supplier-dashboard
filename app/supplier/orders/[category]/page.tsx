'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_ORDERS } from '@/lib/data';

export default function SupplierOrdersPage() {
  const params = useParams();
  const category = params.category as string;
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
          <h2 className="text-2xl font-bold text-white">{formattedCategory} Orders</h2>
          <p className="text-gray-400 text-sm mt-1">Track incoming orders and fulfillment status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-sm">Export CSV</Button>
        </div>
      </div>

      <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg flex items-start gap-3">
         <div className="p-1 bg-blue-500 rounded-full mt-0.5">
           <Bell className="w-3 h-3 text-white" />
         </div>
         <div>
           <h4 className="text-blue-400 font-medium text-sm">New Order Request</h4>
           <p className="text-blue-200/60 text-xs mt-1">You have a new order for 50x Divine Orbs (PoE). Accept within 15m.</p>
         </div>
      </div>

      {/* Table */}
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
              {MOCK_ORDERS.map((row) => (
                <tr key={row.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-gray-300">{row.game}</td>
                  <td className="px-6 py-4 text-gray-300">{row.product}</td>
                  <td className="px-6 py-4 text-gray-300">{row.qty}</td>
                  <td className="px-6 py-4 text-gray-300">{row.price}</td>
                  <td className="px-6 py-4 text-gray-300"><Badge status={row.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-500 hover:text-white transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
