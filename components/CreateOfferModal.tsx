import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface Props {
  onClose: () => void;
  category: string;
}

export const CreateOfferModal = ({ onClose, category }: Props) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
    <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg shadow-2xl">
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <h3 className="text-xl font-bold text-white">New {category} Offer</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <Input label="Game Title" placeholder="e.g., Elden Ring" />
        <Input label="Product Name" placeholder="e.g., 1M Runes" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Price ($)" placeholder="0.00" type="number" />
          <Input label="Stock" placeholder="100" type="number" />
        </div>
      </div>
      <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/50 rounded-b-xl">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onClose}>Create Offer</Button>
      </div>
    </div>
  </div>
);
