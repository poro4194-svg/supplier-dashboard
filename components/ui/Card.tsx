import React from 'react';

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-gray-900 border border-gray-800 rounded-xl p-6 ${className}`}>
    {children}
  </div>
);