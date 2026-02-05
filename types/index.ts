export type Role = 'admin' | 'supplier';

export interface User {
  username: string;
  role: Role;
}

export interface Offer {
  id: number;
  game: string;
  product: string;
  price: string;
  stock?: number;
  status: 'Active' | 'Pending' | 'Inactive';
}

export interface Order {
  id: number;
  game: string;
  product: string;
  qty: number;
  price: string;
  status: 'Completed' | 'Processing' | 'Pending';
}
