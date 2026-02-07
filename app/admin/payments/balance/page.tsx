'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useAppData } from '@/context/AppDataContext';
import type { Order, SupplierId } from '@/types';
import { SUPPLIERS } from '@/types';

type Preset = 'last24h' | 'today' | 'custom';

function parseMoney(v: string) {
  const n = Number((v ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function startOfTodayTs(nowTs: number) {
  const d = new Date(nowTs);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function formatInputDate(ts: number) {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getRangeFromPreset(preset: Preset, nowTs: number, customFrom: number, customTo: number) {
  if (preset === 'today') {
    return { from: startOfTodayTs(nowTs), to: nowTs };
  }
  if (preset === 'custom') {
    const from = Math.min(customFrom, customTo);
    const to = Math.max(customFrom, customTo);
    return { from, to };
  }
  return { from: nowTs - 24 * 60 * 60 * 1000, to: nowTs }; // last24h
}

// -------------------
// ✅ V-BUCKS COST MAP (fallback za stare ordere bez orderCost)
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

// "10,000 V-Bucks" / "10000 vbucks" / "10000 VB" / "V-Bucks 2800"
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

function getStableOrderCost(o: Order): number {
  // 1) ako postoji orderCost — koristi ga
  const fromField = parseMoney((o as any).orderCost ?? ''); // (any samo za runtime safety, ne menja tipove)
  if (fromField > 0) return fromField;

  // 2) fallback (stari storage): probaj da pogodiš iz product string-a
  return parseMoney(guessOrderCostFromProduct(o.product));
}

export default function BalancePage() {
  const { orders } = useAppData();

  // ✅ (kao kod tebe) “freeze” now jednom
  const [nowTs] = useState<number>(() => Date.now());

  const [preset, setPreset] = useState<Preset>('last24h');

  // custom range
  const [customFrom, setCustomFrom] = useState<number>(() => startOfTodayTs(Date.now()));
  const [customTo, setCustomTo] = useState<number>(() => Date.now());

  const { rangeFrom, rangeTo } = useMemo(() => {
    const r = getRangeFromPreset(preset, nowTs, customFrom, customTo);
    return { rangeFrom: r.from, rangeTo: r.to };
  }, [preset, nowTs, customFrom, customTo]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const ts = o.createdAt ?? 0;
      return ts >= rangeFrom && ts <= rangeTo;
    });
  }, [orders, rangeFrom, rangeTo]);

  const totals = useMemo(() => {
    const completed = filteredOrders.filter(o => o.status === 'Completed');

    const totalRevenue = completed.reduce((sum, o) => sum + parseMoney(o.price) * (o.qty ?? 1), 0);

    const totalCost = completed.reduce((sum, o) => {
      const costPer = getStableOrderCost(o);
      return sum + costPer * (o.qty ?? 1);
    }, 0);

    const totalProfit = totalRevenue - totalCost;
    const each = totalProfit / 3;

    return { totalRevenue, totalCost, totalProfit, each };
  }, [filteredOrders]);

  const bySupplier = useMemo(() => {
    const map = new Map<SupplierId, number>();
    for (const s of SUPPLIERS) map.set(s.id, 0);

    for (const o of filteredOrders) {
      if (o.status !== 'Completed') continue;
      const prev = map.get(o.supplierId) ?? 0;
      map.set(o.supplierId, prev + parseMoney(o.price) * (o.qty ?? 1));
    }
    return map;
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Balance</h2>
        <p className="text-gray-400 text-sm mt-1">
          Overview for selected date range. Default is last 24h.
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-gray-900 border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Preset</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as Preset)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500"
            >
              <option value="last24h">Last 24h</option>
              <option value="today">Today</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">From</label>
            <input
              type="date"
              value={formatInputDate(customFrom)}
              disabled={preset !== 'custom'}
              onChange={(e) => {
                const d = new Date(e.target.value);
                const ts = d.getTime();
                if (Number.isFinite(ts)) setCustomFrom(ts);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">To</label>
            <input
              type="date"
              value={formatInputDate(customTo)}
              disabled={preset !== 'custom'}
              onChange={(e) => {
                const d = new Date(e.target.value);
                const end = d.getTime() + 24 * 60 * 60 * 1000 - 1; // end of day
                if (Number.isFinite(end)) setCustomTo(end);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500 disabled:opacity-50"
            />
          </div>

          <div className="flex items-end">
            <div className="w-full text-right">
              <div className="text-xs text-gray-400">Completed revenue</div>
              <div className="text-xl font-bold text-white">${totals.totalRevenue.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gray-900 border border-gray-800">
          <div className="text-xs text-gray-400">Total Cost</div>
          <div className="text-2xl font-bold text-white">${totals.totalCost.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">
            (uzima Order.orderCost; fallback guess iz product string-a za stare)
          </div>
        </Card>

        <Card className="p-4 bg-gray-900 border border-gray-800">
          <div className="text-xs text-gray-400">Total Profit</div>
          <div className="text-2xl font-bold text-white">${totals.totalProfit.toFixed(2)}</div>
        </Card>

        <Card className="p-4 bg-gray-900 border border-gray-800">
          <div className="text-xs text-gray-400">Total Profit Each (÷3)</div>
          <div className="text-2xl font-bold text-white">${totals.each.toFixed(2)}</div>
        </Card>
      </div>

      {/* Supplier breakdown */}
      <Card className="p-4 bg-gray-900 border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-white">Revenue by Supplier (Completed)</div>
          <div className="text-xs text-gray-500">
            Range: {new Date(rangeFrom).toLocaleDateString()} → {new Date(rangeTo).toLocaleDateString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SUPPLIERS.map(s => (
            <div key={s.id} className="rounded-lg border border-gray-800 bg-gray-950 p-3">
              <div className="text-xs text-gray-400">{s.name}</div>
              <div className="text-lg font-bold text-white">
                ${(bySupplier.get(s.id) ?? 0).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}