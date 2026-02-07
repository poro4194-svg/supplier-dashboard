'use client';

import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Package, Coins, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CreateOfferModal } from '@/components/CreateOfferModal';
import { useAppData } from '@/context/AppDataContext';
import type { OfferCategory, SupplierId, VbucksPack } from '@/types';

function parseMoney(price: string) {
  const n = Number(price.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

// -------------------
// ✅ V-BUCKS COST MAP
// -------------------
const VBUCKS_COST_USD: Record<number, number> = {
  1000: 3.44,
  2800: 8.58,
  5000: 13.81,
  10000: 27.62,
  13500: 33.6,
  27000: 67.2,
  40500: 100.81,
  54000: 134.41,
  108000: 268.82,
};

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

// fallback ako neko ručno promeni product text
function extractVBucksAmount(product: string): number | null {
  const s = (product ?? '').toLowerCase();
  const m = s.match(/(\d[\d,.\s]*)\s*(v[-\s]?bucks|vbucks|vb)\b/);
  if (!m) return null;
  const raw = m[1].replace(/[,\s.]/g, '');
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function guessOrderCostFromProduct(product: string): string {
  const amount = extractVBucksAmount(product);
  if (!amount) return '$0.00';
  const c = VBUCKS_COST_USD[amount];
  if (typeof c !== 'number') return '$0.00';
  return money(c);
}

function orderCostFromPack(pack?: VbucksPack): string {
  if (!pack) return '$0.00';
  const c = VBUCKS_COST_USD[pack];
  if (typeof c !== 'number') return '$0.00';
  return money(c);
}

export default function AdminOffersPage() {
  const params = useParams();

  const raw = params.category;
  const category = (Array.isArray(raw) ? raw[0] : raw) as OfferCategory;

  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  const [showModal, setShowModal] = useState(false);

  const { offers, orders, addOffer, addOrder } = useAppData();

  const filteredOffers = useMemo(() => offers.filter(o => o.category === category), [offers, category]);
  const filteredOrders = useMemo(() => orders.filter(o => o.category === category), [orders, category]);

  const stats = useMemo(() => {
    const activeOffers = filteredOffers.filter(o => o.status !== 'Completed' && o.status !== 'Inactive').length;
    const pendingOrders = filteredOrders.filter(o => o.status === 'Pending').length;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const revenueToday = filteredOrders
      .filter(o => o.status === 'Completed' && (o.createdAt ?? 0) >= startOfDay)
      .reduce((sum, o) => sum + parseMoney(o.price) * (o.qty ?? 1), 0);

    return { activeOffers, pendingOrders, revenueToday };
  }, [filteredOffers, filteredOrders]);

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
            <p className="text-2xl font-bold text-white">{stats.activeOffers}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Revenue (Today)</p>
            <p className="text-2xl font-bold text-white">${stats.revenueToday.toFixed(2)}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Orders</p>
            <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
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
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {filteredOffers.map((row) => (
                <tr key={row.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-gray-300">{row.game}</td>
                  <td className="px-6 py-4 text-gray-300">{row.product}</td>
                  <td className="px-6 py-4 text-gray-300">{row.price}</td>
                  <td className="px-6 py-4 text-gray-300">
                    <Badge status={row.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-300">{row.supplierId ?? '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-500 hover:text-white transition-colors">Edit</button>
                  </td>
                </tr>
              ))}

              {filteredOffers.length === 0 && (
                <tr>
                  <td className="px-6 py-10 text-gray-500" colSpan={6}>
                    No offers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <CreateOfferModal
          category={category}
          onClose={() => setShowModal(false)}
          onCreate={({
            game,
            product,
            price,
            stock,
            supplierId,
            vbucksPack, // ✅ NEW
          }: {
            game: string;
            product: string;
            price: string;
            stock?: number;
            supplierId: SupplierId;
            vbucksPack?: VbucksPack;
          }) => {
            const createdOffer = addOffer({
              category,
              game,
              product,
              price,
              stock,
              status: 'Pending',
              supplierId,
              // (optional) ako si dodao u Offer type:
              // vbucksPack,
            });

            // ✅ Cost: prvo pack, fallback regex
            const orderCost =
              category === 'currency'
                ? (vbucksPack ? orderCostFromPack(vbucksPack) : guessOrderCostFromProduct(product))
                : '$0.00';

            addOrder({
              offerId: createdOffer.id,
              category,
              game,
              product,
              qty: 1,
              price,
              orderCost,
              supplierId,
              status: 'Pending',
            });

            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
