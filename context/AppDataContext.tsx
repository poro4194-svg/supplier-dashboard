'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  Offer,
  Order,
  OrderStatus,
  OfferStatus,
  SupplierId,
  OfferCategory,
} from '@/types';

type AppDataContextType = {
  offers: Offer[];
  orders: Order[];

  addOffer: (offer: Omit<Offer, 'id' | 'createdAt'>) => Offer;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;

  updateOffer: (id: number, patch: Partial<Omit<Offer, 'id' | 'createdAt'>>) => void;
  archiveOffer: (id: number) => void;

  updateOrderStatus: (id: number, status: OrderStatus) => void;

  clearAll: () => void;
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const OFFERS_KEY = 'app_offers_v1';
const ORDERS_KEY = 'app_orders_v1';

// seed cleanup
const SEED_OFFER_GAMES = new Set(['Elden Ring', 'WoW', 'Diablo 4']);
const SEED_ORDER_GAMES = new Set(['Lost Ark', 'PoE']);

// -----------------------------
// ✅ helpers (no "any")
// -----------------------------
function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function toNumber(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function toString(v: unknown, fallback: string): string {
  return typeof v === 'string' ? v : fallback;
}

function isSupplierId(v: unknown): v is SupplierId {
  return v === 'ffin' || v === 'sup2' || v === 'sup3';
}

function isOfferCategory(v: unknown): v is OfferCategory {
  return v === 'account' || v === 'item' || v === 'currency';
}

function isOrderStatus(v: unknown): v is OrderStatus {
  return v === 'Pending' || v === 'Active' || v === 'Processing' || v === 'Completed';
}

function migrateOrderStatus(s: unknown): OrderStatus {
  return isOrderStatus(s) ? s : 'Pending';
}

function migrateOfferStatus(s: unknown): OfferStatus {
  // OfferStatus = OrderStatus | 'Inactive'
  if (s === 'Inactive') return 'Inactive';
  if (isOrderStatus(s)) return s;

  // legacy fallback
  if (s === 'Active') return 'Pending';
  if (s === 'Pending') return 'Pending';

  return 'Pending';
}

function isSeedOffers(list: Offer[]) {
  return list.some(o => SEED_OFFER_GAMES.has(o.game));
}

function isSeedOrders(list: Order[]) {
  return list.some(o => SEED_ORDER_GAMES.has(o.game));
}

// ✅ ključ za match offer<->order (kad nema offerId ili je pogrešan)
function makeOfferKey(x: {
  category: OfferCategory;
  game: string;
  product: string;
  price: string;
  supplierId?: SupplierId;
}) {
  return `${x.category}||${x.game}||${x.product}||${x.price}||${x.supplierId ?? ''}`;
}

function migrateOffer(raw: unknown): Offer | null {
  if (!isRecord(raw)) return null;

  const id = toNumber(raw.id, NaN);
  const category = raw.category;
  const game = toString(raw.game, '');
  const product = toString(raw.product, '');
  const price = toString(raw.price, '');

  if (!Number.isFinite(id)) return null;
  if (!isOfferCategory(category)) return null;
  if (!game || !product || !price) return null;

  const supplierId = isSupplierId(raw.supplierId) ? raw.supplierId : undefined;

  return {
    id,
    category,
    game,
    product,
    price,
    stock: typeof raw.stock === 'number' ? raw.stock : undefined,
    status: migrateOfferStatus(raw.status),
    supplierId,
    createdAt: toNumber(raw.createdAt, Date.now()),
  };
}

function migrateOrder(raw: unknown): Order | null {
  if (!isRecord(raw)) return null;

  const id = toNumber(raw.id, NaN);
  const category = raw.category;
  const game = toString(raw.game, '');
  const product = toString(raw.product, '');
  const price = toString(raw.price, '');

  if (!Number.isFinite(id)) return null;
  if (!isOfferCategory(category)) return null;
  if (!game || !product || !price) return null;

  const supplierId: SupplierId = isSupplierId(raw.supplierId) ? raw.supplierId : 'ffin';

  // ✅ offerId fallback (stari storage)
  const offerId = toNumber(raw.offerId, Number.isFinite(id) ? id : Date.now());

  // ✅ NEW: orderCost required
  // - ako ga nema u storage-u, fallback: price (nije idealno, ali spašava app)
  const orderCost = toString(raw.orderCost, price);

  return {
    id,
    offerId,
    category,
    game,
    product,
    qty: toNumber(raw.qty, 1),
    price,
    orderCost,
    supplierId,
    status: migrateOrderStatus(raw.status),
    createdAt: toNumber(raw.createdAt, Date.now()),
  };
}

function loadInitialData(): { offers: Offer[]; orders: Order[] } {
  const offersRaw = safeParse(localStorage.getItem(OFFERS_KEY));
  const ordersRaw = safeParse(localStorage.getItem(ORDERS_KEY));

  const offerListUnknown = isArray(offersRaw) ? offersRaw : [];
  const orderListUnknown = isArray(ordersRaw) ? ordersRaw : [];

  const migratedOffers = offerListUnknown.map(migrateOffer).filter(Boolean) as Offer[];
  const migratedOrders = orderListUnknown.map(migrateOrder).filter(Boolean) as Order[];

  // seed cleanup
  const cleanOffers = isSeedOffers(migratedOffers) ? [] : migratedOffers;
  const cleanOrders = isSeedOrders(migratedOrders) ? [] : migratedOrders;

  // ---- REPAIR: fix offerId for old orders + sync offer.status ----
  const offerById = new Map<number, Offer>();
  const offerByKey = new Map<string, Offer>();

  for (const ofr of cleanOffers) {
    offerById.set(ofr.id, ofr);
    offerByKey.set(
      makeOfferKey({
        category: ofr.category,
        game: ofr.game,
        product: ofr.product,
        price: ofr.price,
        supplierId: ofr.supplierId,
      }),
      ofr
    );
  }

  const repairedOrders: Order[] = cleanOrders.map(ord => {
    if (!offerById.has(ord.offerId)) {
      const match = offerByKey.get(
        makeOfferKey({
          category: ord.category,
          game: ord.game,
          product: ord.product,
          price: ord.price,
          supplierId: ord.supplierId,
        })
      );
      if (match) return { ...ord, offerId: match.id };
    }
    return ord;
  });

  const latestStatusByOfferId = new Map<number, { createdAt: number; status: OrderStatus }>();
  for (const ord of repairedOrders) {
    const ts = ord.createdAt ?? 0;
    const existing = latestStatusByOfferId.get(ord.offerId);
    if (!existing || ts >= existing.createdAt) {
      latestStatusByOfferId.set(ord.offerId, { createdAt: ts, status: ord.status });
    }
  }

  const repairedOffers: Offer[] = cleanOffers.map(ofr => {
    const latest = latestStatusByOfferId.get(ofr.id);
    if (!latest) return ofr;
    if (ofr.status === 'Inactive') return ofr;
    return { ...ofr, status: latest.status };
  });

  return { offers: repairedOffers, orders: repairedOrders };
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [{ offers, orders }, setData] = useState(() => loadInitialData());

  // ✅ Persist whenever data changes (nema hydrated state, nema setState u effect)
  useEffect(() => {
    localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOffer = useCallback((offer: Omit<Offer, 'id' | 'createdAt'>) => {
    const now = Date.now();
    const newOffer: Offer = { ...offer, id: now, createdAt: now };
    setData(prev => ({ ...prev, offers: [newOffer, ...prev.offers] }));
    return newOffer;
  }, []);

  const addOrder = useCallback((order: Omit<Order, 'id' | 'createdAt'>) => {
    const now = Date.now();
    const newOrder: Order = { ...order, id: now + 1, createdAt: now };
    setData(prev => ({ ...prev, orders: [newOrder, ...prev.orders] }));
    return newOrder;
  }, []);

  const updateOffer = useCallback((id: number, patch: Partial<Omit<Offer, 'id' | 'createdAt'>>) => {
    setData(prev => ({
      ...prev,
      offers: prev.offers.map(o => (o.id === id ? { ...o, ...patch } : o)),
    }));
  }, []);

  const archiveOffer = useCallback((id: number) => {
    setData(prev => ({
      ...prev,
      offers: prev.offers.map(o => (o.id === id ? { ...o, status: 'Inactive' } : o)),
    }));
  }, []);

  const updateOrderStatus = useCallback((id: number, status: OrderStatus) => {
    setData(prev => {
      const target = prev.orders.find(o => o.id === id);
      if (!target) return prev;

      const offerId = target.offerId;

      const nextOrders = prev.orders.map(o => (o.id === id ? { ...o, status } : o));
      const nextOffers = prev.offers.map(of => {
        if (of.id !== offerId) return of;
        if (of.status === 'Inactive') return of;
        return { ...of, status };
      });

      return { offers: nextOffers, orders: nextOrders };
    });
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem(OFFERS_KEY);
    localStorage.removeItem(ORDERS_KEY);
    setData({ offers: [], orders: [] });
  }, []);

  const value = useMemo(
    () => ({
      offers,
      orders,
      addOffer,
      addOrder,
      updateOffer,
      archiveOffer,
      updateOrderStatus,
      clearAll,
    }),
    [offers, orders, addOffer, addOrder, updateOffer, archiveOffer, updateOrderStatus, clearAll]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}