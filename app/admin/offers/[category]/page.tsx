'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Package, Coins, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CreateOfferModal } from '@/components/CreateOfferModal';
import { useAppData } from '@/context/AppDataContext';
import type { OfferCategory } from '@/types';

export default function AdminOffersPage() {
  const params = useParams();

  const raw = params.category;
  const category = (Array.isArray(raw) ? raw[0] : raw) as OfferCategory;

  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  const [showModal, setShowModal] = useState(false);
  const { offers, addOffer, addOrder } = useAppData();

  const filteredOffers = offers.filter(o => o.category === category);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{formattedCategory} Offers</h2>
          <p className="text-gray-400 text-sm mt-1">Manage your active listings and pricing</p>
        </div>
        <Button onClick={() => setShowModal(true)} variant="primary">
          <Plus className="w-4 h-4" />
          New Offer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Active</p>
            <p className="text-2xl font-bold text-white">1,234</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Revenue (Today)</p>
            <p className="text-2xl font-bold text-white">$845.00</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Actions</p>
            <p className="text-2xl font-bold text-white">12</p>
          </div>
        </Card>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800/50 text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">Game</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredOffers.map((row) => (
                <tr key={row.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-gray-300">{row.game}</td>
                  <td className="px-6 py-4 text-gray-300">{row.product}</td>
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

      {showModal && (
        <CreateOfferModal
          category={category} // ✅ OVO JE FIX
          onClose={() => setShowModal(false)}
          onCreate={({ game, product, price }: { game: string; product: string; price: string }) => {
            addOffer({
              category,
              game,
              product,
              price,
              status: 'Active',
            });

            addOrder({
              category,
              game,
              product,
              qty: 1,
              price,
              status: 'Pending',
            });
          }}
        />
      )}
    </div>
  );
}
