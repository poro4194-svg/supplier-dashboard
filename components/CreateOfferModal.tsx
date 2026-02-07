'use client';

import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAppData } from '@/context/AppDataContext';
import type { OfferCategory, Offer, SupplierId, VbucksPack } from '@/types';
import { SUPPLIERS } from '@/types';

type CreatePayload = {
  game: string;
  product: string;
  price: string;
  stock?: number;
  supplierId: SupplierId;
  vbucksPack?: VbucksPack; // ✅ NEW (samo za currency)
};

interface Props {
  onClose: () => void;
  category: OfferCategory;
  onCreate?: (payload: CreatePayload) => void;
}

const VBUCKS_PACKS: { value: VbucksPack; label: string }[] = [
  { value: 1000, label: '1,000 V-Bucks' },
  { value: 2800, label: '2,800 V-Bucks' },
  { value: 5000, label: '5,000 V-Bucks' },
  { value: 10000, label: '10,000 V-Bucks' },
  { value: 13500, label: '13,500 V-Bucks' },
  { value: 27000, label: '27,000 V-Bucks' },
  { value: 40500, label: '40,500 V-Bucks' },
  { value: 54000, label: '54,000 V-Bucks' },
  { value: 108000, label: '108,000 V-Bucks' },
];

export const CreateOfferModal = ({ onClose, category, onCreate }: Props) => {
  const { addOffer } = useAppData();

  const defaultSupplier = useMemo(() => SUPPLIERS[0]?.id ?? 'ffin', []);
  const [supplierId, setSupplierId] = useState<SupplierId>(defaultSupplier);

  const [game, setGame] = useState('');
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState<number>(0);

  // ✅ currency-only
  const [vbucksPack, setVbucksPack] = useState<VbucksPack | ''>('');

  const normalizePrice = (raw: string) => {
    const p = raw.trim();
    if (!p) return '';
    return p.startsWith('$') ? p : `$${p}`;
  };

  const handlePackChange = (raw: string) => {
    if (!raw) {
      setVbucksPack('');
      return;
    }

    const pack = Number(raw) as VbucksPack;
    setVbucksPack(pack);

    // ✅ small helpers (fast workflow)
    if (!game.trim()) setGame('Fortnite');
    setProduct(`${pack.toLocaleString()} V-Bucks`);
  };

  const handleCreate = () => {
    if (!game.trim() || !product.trim() || !price.trim()) return;

    // ✅ if currency – require pack (you can remove this rule if you want)
    if (category === 'currency' && !vbucksPack) return;

    const payload: CreatePayload = {
      game: game.trim(),
      product: product.trim(),
      price: normalizePrice(price),
      stock: stock ? stock : undefined,
      supplierId,
      vbucksPack: category === 'currency' ? (vbucksPack || undefined) : undefined,
    };

    // ✅ Parent radi offer+order
    if (onCreate) {
      onCreate(payload);
      onClose();
      return;
    }

    // ✅ Fallback: samo offer
    const offer: Omit<Offer, 'id' | 'createdAt'> = {
      category,
      game: payload.game,
      product: payload.product,
      price: payload.price,
      stock: payload.stock,
      status: 'Pending',
      supplierId: payload.supplierId,
      vbucksPack: payload.vbucksPack,
    };

    addOffer(offer);
    onClose();
  };

  const isCurrency = category === 'currency';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold text-white">New {category} Offer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* ✅ Supplier select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Send to Supplier</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value as SupplierId)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500"
            >
              {SUPPLIERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Currency pack dropdown */}
          {isCurrency && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">V-Bucks Pack</label>
              <select
                value={vbucksPack ? String(vbucksPack) : ''}
                onChange={(e) => handlePackChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500"
              >
                <option value="">Select pack...</option>
                {VBUCKS_PACKS.map((p) => (
                  <option key={p.value} value={String(p.value)}>
                    {p.label}
                  </option>
                ))}
              </select>

              <p className="text-xs text-gray-500 mt-1">
                Pack is required for Currency offers (to calculate cost/profit later).
              </p>
            </div>
          )}

          <Input
            label="Game Title"
            placeholder="e.g., Fortnite"
            value={game}
            onChange={(e) => setGame(e.target.value)}
          />

          <Input
            label="Product Name"
            placeholder={isCurrency ? 'e.g., 10,000 V-Bucks' : 'e.g., 1M Runes'}
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              placeholder="15.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <Input
              label="Stock"
              placeholder="100"
              type="number"
              value={stock ? String(stock) : ''}
              onChange={(e) => setStock(Number(e.target.value))}
            />
          </div>

          <p className="text-xs text-gray-500">
            Category is set by the page: <span className="text-gray-300">{category}</span>
          </p>
        </div>

        <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/50 rounded-b-xl">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            Create Offer
          </Button>
        </div>
      </div>
    </div>
  );
};
