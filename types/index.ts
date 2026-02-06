export type Role = 'admin' | 'supplier';
export type OfferCategory = 'account' | 'item' | 'currency';

export interface User {
  username: string;
  role: Role;
}

export interface Offer {
  id: number;
  category: OfferCategory;
  game: string;
  product: string;
  price: string;
  stock?: number;
  status: 'Active' | 'Pending' | 'Inactive';
  createdAt?: string; // ✅ timestamp (Date.now())
}

export interface Order {
  id: number;
  category: OfferCategory;
  game: string;
  product: string;
  qty: number;
  price: string;
  status: 'Completed' | 'Processing' | 'Pending';
  createdAt?: string; // ✅ timestamp (Date.now())
}
