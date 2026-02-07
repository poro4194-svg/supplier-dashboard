'use client';

import React, { useMemo, useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Calendar, Info } from 'lucide-react';
import type { Offer, Order } from '@/types';

function parseMoney(value: string): number {
  const cleaned = value
    .replace(/\s/g, '')
    .replace(/[€$]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatEUR(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function endOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function toDateInputValue(ts: number) {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * ✅ createdAt normalizacija:
 * - number (timestamp)
 * - string (parseable)
 * - undefined/null -> null
 */
function toTs(createdAt: unknown): number | null {
  if (typeof createdAt === 'number' && Number.isFinite(createdAt)) return createdAt;

  if (typeof createdAt === 'string') {
    const parsed = Date.parse(createdAt);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function inRange(ts: number, start: number, end: number) {
  return ts >= start && ts <= end;
}

export default function AdminAnalyticsPage() {
  const { offers, orders } = useAppData();

  // ✅ purity fix: Date.now() samo u lazy init (ne u renderu)
  const [nowTs] = useState<number>(() => Date.now());

  const defaultEnd = endOfDay(nowTs);
  const defaultStart = startOfDay(nowTs - 13 * 24 * 60 * 60 * 1000);

  const [rangeStart, setRangeStart] = useState<number>(defaultStart);
  const [rangeEnd, setRangeEnd] = useState<number>(defaultEnd);
  const [pickerOpen, setPickerOpen] = useState(false);

  const last24hStart = nowTs - 24 * 60 * 60 * 1000;
  const last24hEnd = nowTs;

  const metrics24h = useMemo(() => {
    const orders24h = orders.filter((o: Order) => {
      const ts = toTs(o.createdAt);
      return ts !== null && inRange(ts, last24hStart, last24hEnd);
    });

    const offers24h = offers.filter((o: Offer) => {
      const ts = toTs(o.createdAt);
      return ts !== null && inRange(ts, last24hStart, last24hEnd);
    });

    const ordersCount = orders24h.length;
    const listedOffers = offers24h.length;

    const profit = orders24h.reduce((sum, o) => sum + parseMoney(o.price) * (o.qty ?? 1), 0);

    return { ordersCount, profit, listedOffers };
  }, [offers, orders, last24hStart, last24hEnd]);

  const metricsRange = useMemo(() => {
    const rOrders = orders.filter((o: Order) => {
      const ts = toTs(o.createdAt);
      return ts !== null && inRange(ts, rangeStart, rangeEnd);
    });

    const rOffers = offers.filter((o: Offer) => {
      const ts = toTs(o.createdAt);
      return ts !== null && inRange(ts, rangeStart, rangeEnd);
    });

    const ordersCount = rOrders.length;
    const listedOffers = rOffers.length;

    const profit = rOrders.reduce((sum, o) => sum + parseMoney(o.price) * (o.qty ?? 1), 0);

    return { ordersCount, profit, listedOffers };
  }, [offers, orders, rangeStart, rangeEnd]);

  const profitDelta = useMemo(() => {
    const len = rangeEnd - rangeStart;
    const prevStart = rangeStart - len;
    const prevEnd = rangeEnd - len;

    const prevOrders = orders.filter((o: Order) => {
      const ts = toTs(o.createdAt);
      return ts !== null && inRange(ts, prevStart, prevEnd);
    });

    const prevProfit = prevOrders.reduce((sum, o) => sum + parseMoney(o.price) * (o.qty ?? 1), 0);

    const delta = metricsRange.profit - prevProfit;
    const pct = prevProfit > 0 ? (delta / prevProfit) * 100 : null;

    return { delta, pct };
  }, [orders, rangeStart, rangeEnd, metricsRange.profit]);

  const rangeLabel = `${new Date(rangeStart).toLocaleDateString('en-GB', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })} - ${new Date(rangeEnd).toLocaleDateString('en-GB', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Good evening, Poro</h1>

        <div className="relative">
          <Button variant="secondary" onClick={() => setPickerOpen(v => !v)} className="gap-2">
            <Calendar className="w-4 h-4" />
            Select Date Range
            <span className="text-gray-300 ml-2">{rangeLabel}</span>
          </Button>

          {pickerOpen && (
            <div className="absolute right-0 mt-3 w-[320px] rounded-xl border border-gray-800 bg-gray-900 shadow-2xl p-4 z-50">
              <div className="text-sm text-gray-300 font-medium mb-3">Pick range</div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="From"
                  type="date"
                  value={toDateInputValue(rangeStart)}
                  onChange={(e) => setRangeStart(startOfDay(new Date(e.target.value).getTime()))}
                />
                <Input
                  label="To"
                  type="date"
                  value={toDateInputValue(rangeEnd)}
                  onChange={(e) => setRangeEnd(endOfDay(new Date(e.target.value).getTime()))}
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" onClick={() => setPickerOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
          <Info className="w-4 h-4" />
          Analytics are based on CET timezone
        </div>
      </div>

      <Card className="p-0 overflow-hidden border border-gray-800 bg-gray-900">
        <div className="px-6 py-4 text-gray-300 font-medium border-b border-gray-800">Last 24h</div>
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="p-6 border-b md:border-b-0 md:border-r border-gray-800">
            <div className="text-sm text-gray-400 mb-2">Orders</div>
            <div className="text-4xl font-bold text-white">{metrics24h.ordersCount}</div>
          </div>
          <div className="p-6 border-b md:border-b-0 md:border-r border-gray-800">
            <div className="text-sm text-gray-400 mb-2">Profit</div>
            <div className="text-4xl font-bold text-white">{formatEUR(metrics24h.profit)}</div>
          </div>
          <div className="p-6">
            <div className="text-sm text-gray-400 mb-2">Listed Offers</div>
            <div className="text-4xl font-bold text-white">{metrics24h.listedOffers}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-gray-800 bg-gray-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-gray-400">Total Profits</div>
              <div className="text-4xl font-bold text-white mt-2">{formatEUR(metricsRange.profit)}</div>

              <div className="mt-3 text-sm">
                {profitDelta.pct === null ? (
                  <span className="text-gray-500">— vs previous period</span>
                ) : (
                  <span className={profitDelta.delta >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {profitDelta.delta >= 0 ? '+' : ''}
                    {formatEUR(profitDelta.delta)} ({profitDelta.pct >= 0 ? '+' : ''}
                    {profitDelta.pct.toFixed(2)}%) <span className="text-gray-500">vs previous period</span>
                  </span>
                )}
              </div>
            </div>

            <Button variant="ghost" className="px-3">
              ...
            </Button>
          </div>
        </Card>

        <Card className="p-6 border border-gray-800 bg-gray-900">
          <div className="text-sm text-gray-400">Orders</div>
          <div className="text-4xl font-bold text-white mt-2">{metricsRange.ordersCount}</div>
          <div className="mt-3 text-sm text-gray-500">Selected range</div>
        </Card>
      </div>
    </div>
  );
}
