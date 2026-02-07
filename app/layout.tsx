import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

import { AuthProvider } from '@/context/AuthContext';
import { AppDataProvider } from '@/context/AppDataContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'PoroGold',
  description: 'Game Service Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <AuthProvider>
          <AppDataProvider>{children}</AppDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
