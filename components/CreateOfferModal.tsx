'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAppData } from '@/context/AppDataContext';
import type { OfferCategory, Offer } from '@/types';

type CreatePayload = {
  game: string;
  product: string;
  price: string;
  stock?: number;
};

interface Props {
  onClose: () => void;
  category: OfferCategory;
  onCreate?: (payload: CreatePayload) => void; // ✅ NOVO (opciono)
}

export const CreateOfferModal = ({ onClose, category, onCreate }: Props) => {
  const { addOffer } = useAppData();

  const [game, setGame] = useState('');
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState<number>(0);

  const normalizePrice = (raw: string) => {
    const p = raw.trim();
    if (!p) return '';
    return p.startsWith('$') ? p : `$${p}`;
  };

  const handleCreate = () => {
    if (!game.trim() || !product.trim() || !price.trim()) return;

    const payload: CreatePayload = {
      game: game.trim(),
      product: product.trim(),
      price: normalizePrice(price),
      stock: stock ? stock : undefined,
    };

    // ✅ Ako parent prosledi onCreate, parent radi i offer+order
    if (onCreate) {
      onCreate(payload);
      onClose();
      return;
    }

    // ✅ Fallback (radi i bez onCreate): samo dodaj offer
    const offer: Omit<Offer, 'id'> = {
      category,
      game: payload.game,
      product: payload.product,
      price: payload.price,
      stock: payload.stock,
      status: 'Active',
    };

    addOffer(offer);
    onClose();
  };

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
          <Input
            label="Game Title"
            placeholder="e.g., Elden Ring"
            value={game}
            onChange={(e) => setGame(e.target.value)}
          />
          <Input
            label="Product Name"
            placeholder="e.g., 1M Runes"
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
