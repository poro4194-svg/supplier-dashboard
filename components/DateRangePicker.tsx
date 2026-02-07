
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

export type DateRange = { from: number; to: number };

function startOfDay(ts: number) {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function endOfDay(ts: number) {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
}

function formatRange(from: number, to: number) {
  const f = new Date(from).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  const t = new Date(to).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  return `${f} - ${t}`;
}

function toDateValue(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

function fromDateValue(value: string) {
  // "2026-02-07" -> timestamp at local midnight
  return new Date(value + 'T00:00:00').getTime();
}

type Preset = { label: string; getRange: () => DateRange };

export function DateRangePicker({
  value,
  onChange,
  label = 'Select Date Range',
}: {
  value: DateRange;
  onChange: (next: DateRange) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      const el = wrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const presets: Preset[] = useMemo(
    () => [
      {
        label: 'Today',
        getRange: () => {
          const now = Date.now();
          return { from: startOfDay(now), to: endOfDay(now) };
        },
      },
      {
        label: 'Last 7 days',
        getRange: () => {
          const now = Date.now();
          return { from: startOfDay(now - 6 * 24 * 60 * 60 * 1000), to: endOfDay(now) };
        },
      },
      {
        label: 'Last 2 weeks',
        getRange: () => {
          const now = Date.now();
          return { from: startOfDay(now - 13 * 24 * 60 * 60 * 1000), to: endOfDay(now) };
        },
      },
      {
        label: 'Last 30 days',
        getRange: () => {
          const now = Date.now();
          return { from: startOfDay(now - 29 * 24 * 60 * 60 * 1000), to: endOfDay(now) };
        },
      },
    ],
    []
  );

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-200 hover:bg-gray-800/60 transition"
      >
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-400">{formatRange(value.from, value.to)}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[340px] rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl p-4 z-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">From</label>
              <input
                type="date"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-600"
                value={toDateValue(value.from)}
                onChange={(e) => {
                  const ts = fromDateValue(e.target.value);
                  const next = { from: startOfDay(ts), to: value.to };
                  onChange(next.from > next.to ? { from: next.from, to: endOfDay(ts) } : next);
                }}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">To</label>
              <input
                type="date"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-600"
                value={toDateValue(value.to)}
                onChange={(e) => {
                  const ts = fromDateValue(e.target.value);
                  const next = { from: value.from, to: endOfDay(ts) };
                  onChange(next.from > next.to ? { from: startOfDay(ts), to: next.to } : next);
                }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {presets.map(p => (
              <button
                key={p.label}
                type="button"
                className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-200 hover:bg-gray-800/60 transition"
                onClick={() => {
                  onChange(p.getRange());
                  setOpen(false);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-300 hover:bg-gray-800/60 transition"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
