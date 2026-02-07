export type Role = 'admin' | 'supplier';
export type OfferCategory = 'account' | 'item' | 'currency';

// ✅ 3 supplier naloga
export type SupplierId = 'ffin' | 'sup2' | 'sup3';

export const SUPPLIERS: { id: SupplierId; name: string }[] = [
  { id: 'ffin', name: 'ffin' },
  { id: 'sup2', name: 'Supplier 2' },
  { id: 'sup3', name: 'Supplier 3' },
];

export interface User {
  username: string;
  role: Role;
  supplierId?: SupplierId;
}

// ✅ V-Bucks paketi (STRICT)
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

// ✅ Order workflow status
export type OrderStatus = 'Pending' | 'Active' | 'Processing' | 'Completed';

// ✅ Offer prati order status (plus Inactive)
export type OfferStatus = OrderStatus | 'Inactive';

export interface Offer {
  id: number;
  category: OfferCategory;
  game: string;

  // npr. "10,000 V-Bucks"
  product: string;

  // koliko TI prodaješ
  price: string;

  stock?: number;
  status: OfferStatus;

  supplierId?: SupplierId;
  createdAt?: number;

  // ✅ bitno: zna se koji je pack
  vbucksPack?: VbucksPack;
}

export interface Order {
  id: number;
  offerId: number;

  category: OfferCategory;
  game: string;
  product: string;

  qty: number;

  // ✅ SELL PRICE (tvoja cena)
  price: string;

  // ✅ COST (tvoja kupovna cena)
  orderCost: string;

  // ✅ ključ za finansije
  vbucksPack?: VbucksPack;

  supplierId: SupplierId;
  status: OrderStatus;
  createdAt?: number;
}
