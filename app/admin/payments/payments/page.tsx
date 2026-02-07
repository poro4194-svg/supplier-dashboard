'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SupplierId } from '@/types';
import { SUPPLIERS } from '@/types';

type PaymentType = 'Order Cost' | 'Profit';

type PaymentRow = {
  id: number;
  createdAt: number; // when you logged the payment
  supplierId: SupplierId;
  type: PaymentType;
  quantity: number;
  note?: string;
};

const LS_KEY = 'app_payments_v1';

function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function isSupplierId(x: unknown): x is SupplierId {
  return x === 'ffin' || x === 'sup2' || x === 'sup3';
}

function isPaymentType(x: unknown): x is PaymentType {
  return x === 'Order Cost' || x === 'Profit';
}

function parseRows(raw: unknown): PaymentRow[] {
  if (!Array.isArray(raw)) return [];
  const out: PaymentRow[] = [];

  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue;
    const obj = item as Record<string, unknown>;

    const createdAt = typeof obj.createdAt === 'number' ? obj.createdAt : Date.now();
    const id = typeof obj.id === 'number' ? obj.id : createdAt;

    const supplierId = isSupplierId(obj.supplierId) ? obj.supplierId : 'ffin';
    const type = isPaymentType(obj.type) ? obj.type : 'Profit';
    const quantity = typeof obj.quantity === 'number' ? obj.quantity : 0;
    const note = typeof obj.note === 'string' ? obj.note : undefined;

    out.push({ id, createdAt, supplierId, type, quantity, note });
  }

  return out.sort((a, b) => b.createdAt - a.createdAt);
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString();
}

export default function PaymentsPage() {
  // ✅ init iz LS bez useEffect + bez SSR/edge crash-a
  const [rows, setRows] = useState<PaymentRow[]>(() => {
    if (typeof window === 'undefined') return [];
    const raw = safeParse(window.localStorage.getItem(LS_KEY));
    return parseRows(raw);
  });

  const [supplierId, setSupplierId] = useState<SupplierId>('ffin');
  const [type, setType] = useState<PaymentType>('Profit');
  const [quantity, setQuantity] = useState<number>(0);
  const [note, setNote] = useState<string>('');

  // persist
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LS_KEY, JSON.stringify(rows));
  }, [rows]);

  const supplierCards = useMemo(() => {
    // placeholder strings for now (kasnije ovo prebacimo u editable + LS)
    return SUPPLIERS.map(s => ({
      id: s.id,
      name: s.name,
      details:
        s.id === 'ffin'
          ? 'USDT TRC20: (add later)'
          : s.id === 'sup2'
          ? 'Bank/PayPal: (add later)'
          : 'USDT/BTC: (add later)',
    }));
  }, []);

  const addRow = () => {
    if (!Number.isFinite(quantity) || quantity < 0) return;

    const now = Date.now();
    const newRow: PaymentRow = {
      id: now,
      createdAt: now,
      supplierId,
      type,
      quantity,
      note: note.trim() ? note.trim() : undefined,
    };

    setRows(prev => [newRow, ...prev]);
    setQuantity(0);
    setNote('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Payments</h2>
        <p className="text-gray-400 text-sm mt-1">
          Track how you paid suppliers (manual log). Payment details are placeholders for now.
        </p>
      </div>

      {/* Payment Details boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {supplierCards.map(s => (
          <Card key={s.id} className="p-4 bg-gray-900 border border-gray-800">
            <div className="text-sm font-semibold text-white">{s.name}</div>
            <div className="text-xs text-gray-400 mt-1">Payment details</div>
            <div className="text-sm text-gray-200 mt-2">{s.details}</div>
          </Card>
        ))}
      </div>

      {/* Add payment row */}
      <Card className="p-4 bg-gray-900 border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Supplier</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value as SupplierId)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500"
            >
              {SUPPLIERS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PaymentType)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500"
            >
              <option value="Order Cost">Order Cost</option>
              <option value="Profit">Profit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Quantity</label>
            <input
              type="number"
              value={Number.isFinite(quantity) ? String(quantity) : '0'}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Note (optional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Paid via USDT, tx hash..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="primary" onClick={addRow}>
            Add Payment Row
          </Button>
        </div>
      </Card>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800/50 text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">To (Supplier)</th>
                <th className="px-6 py-4">Note</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-gray-300">{formatDate(r.createdAt)}</td>
                  <td className="px-6 py-4 text-gray-300">{r.type}</td>
                  <td className="px-6 py-4 text-gray-300">{r.quantity}</td>
                  <td className="px-6 py-4 text-gray-300">{r.supplierId}</td>
                  <td className="px-6 py-4 text-gray-300">{r.note ?? '—'}</td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td className="px-6 py-10 text-gray-500" colSpan={5}>
                    No payment rows yet.
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
