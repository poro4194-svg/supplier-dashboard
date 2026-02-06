'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Offer, Order } from '@/types';

type AppDataContextType = {
  offers: Offer[];
  orders: Order[];
  addOffer: (offer: Omit<Offer, 'id'>) => Offer;
  addOrder: (order: Omit<Order, 'id'>) => Order;
  clearAll: () => void;
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const OFFERS_KEY = 'app_offers_v1';
const ORDERS_KEY = 'app_orders_v1';

// Prepoznaj stari "seed" koji ti smeta (da ga automatski očistimo)
const SEED_OFFER_GAMES = new Set(['Elden Ring', 'WoW', 'Diablo 4']);
const SEED_ORDER_GAMES = new Set(['Lost Ark', 'PoE']);

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function isSeedOffers(list: Offer[]) {
  // Ako ima bar 1 seed game u offerima, tretiramo kao seed
  return list.some(o => SEED_OFFER_GAMES.has(o.game));
}

function isSeedOrders(list: Order[]) {
  return list.some(o => SEED_ORDER_GAMES.has(o.game));
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once (bez seed-a)
  useEffect(() => {
    const storedOffers = safeParse<Offer[]>(localStorage.getItem(OFFERS_KEY)) ?? [];
    const storedOrders = safeParse<Order[]>(localStorage.getItem(ORDERS_KEY)) ?? [];

    // Ako su ovo stari seed/mocks, očisti ih
    const cleanOffers = isSeedOffers(storedOffers) ? [] : storedOffers;
    const cleanOrders = isSeedOrders(storedOrders) ? [] : storedOrders;

    if (cleanOffers.length === 0) localStorage.removeItem(OFFERS_KEY);
    if (cleanOrders.length === 0) localStorage.removeItem(ORDERS_KEY);

    setOffers(cleanOffers);
    setOrders(cleanOrders);
    setHydrated(true);
  }, []);

  // Persist (tek nakon što je hydration gotov da ne snimi prazno prerano)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
  }, [offers, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

const addOffer = (offer: Omit<Offer, 'id' | 'createdAt'>) => {
  const now = Date.now();
  const newOffer: Offer = { ...offer, id: now, createdAt: now };
  setOffers(prev => [newOffer, ...prev]);
  return newOffer;
};

const addOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
  const now = Date.now();
  const newOrder: Order = { ...order, id: now + 1, createdAt: now };
  setOrders(prev => [newOrder, ...prev]);
  return newOrder;
};


  const clearAll = () => {
    setOffers([]);
    setOrders([]);
    localStorage.removeItem(OFFERS_KEY);
    localStorage.removeItem(ORDERS_KEY);
  };

  const value = useMemo(
    () => ({ offers, orders, addOffer, addOrder, clearAll }),
    [offers, orders]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
