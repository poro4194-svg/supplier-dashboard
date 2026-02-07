// lib/vbucksCost.ts

export type VbucksPack =
  | 1000
  | 2800
  | 5000
  | 10000
  | 13500
  | 27000
  | 40500
  | 54000
  | 108000;

// ✅ Cost price (koliko TEBE košta)
export const VBUCKS_COST_USD: Record<VbucksPack, number> = {
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

// ---------- helpers ----------

export function formatMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function getOrderCostFromPack(pack?: VbucksPack): string {
  if (!pack) return '$0.00';
  const cost = VBUCKS_COST_USD[pack];
  return typeof cost === 'number' ? formatMoney(cost) : '$0.00';
}

// fallback ako neko dira product text ručno
export function extractVBucksAmount(product: string): VbucksPack | null {
  const s = (product ?? '').toLowerCase();
  const m = s.match(/(\d[\d,.\s]*)\s*(v[-\s]?bucks|vbucks|vb)\b/);
  if (!m) return null;

  const raw = m[1].replace(/[,\s.]/g, '');
  const n = Number(raw);

  return (n in VBUCKS_COST_USD ? n : null) as VbucksPack | null;
}

export function guessOrderCostFromProduct(product: string): string {
  const pack = extractVBucksAmount(product);
  return pack ? getOrderCostFromPack(pack) : '$0.00';
}
