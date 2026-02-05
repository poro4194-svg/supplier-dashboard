import { Offer, Order } from '@/types';

export const MOCK_OFFERS: Offer[] = [
  { id: 1, game: 'Elden Ring', product: 'Runes Stack', price: '$15.00', status: 'Active' },
  { id: 2, game: 'WoW', product: 'Gold (1M)', price: '$45.00', status: 'Pending' },
  { id: 3, game: 'Diablo 4', product: 'Power Leveling', price: '$25.00', status: 'Active' },
];

export const MOCK_ORDERS: Order[] = [
  { id: 101, game: 'Lost Ark', product: 'Gold (100k)', qty: 2, price: '$20.00', status: 'Completed' },
  { id: 102, game: 'PoE', product: 'Divine Orb', qty: 50, price: '$12.50', status: 'Processing' },
];
