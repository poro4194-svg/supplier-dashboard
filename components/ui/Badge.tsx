import React from 'react';
import type { OfferStatus, OrderStatus } from '@/types';

type BadgeStatus = OfferStatus | OrderStatus;

export const Badge = ({ status }: { status: BadgeStatus }) => {
  const styles: Record<BadgeStatus, string> = {
    Active: "bg-green-500/10 text-green-400 border-green-500/20",
    Completed: "bg-green-500/10 text-green-400 border-green-500/20",
    Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Inactive: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {status}
    </span>
  );
};