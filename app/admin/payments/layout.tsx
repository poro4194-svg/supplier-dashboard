import React from 'react';
import Link from 'next/link';

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/payments/balance"
          className="px-3 py-2 rounded-lg text-sm bg-gray-900 border border-gray-800 text-gray-200 hover:bg-gray-800"
        >
          Balance
        </Link>
        <Link
          href="/admin/payments/payments"
          className="px-3 py-2 rounded-lg text-sm bg-gray-900 border border-gray-800 text-gray-200 hover:bg-gray-800"
        >
          Payments
        </Link>
      </div>

      {children}
    </div>
  );
}
