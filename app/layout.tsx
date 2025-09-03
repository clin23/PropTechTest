import './globals.css';
import type { ReactNode } from 'react';
import Providers from './providers';

export const metadata = { title: 'PropTech' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Providers>
          <nav className="p-4 border-b bg-white flex gap-4">
            <a href="/" className="font-semibold">Dashboard</a>
            <a href="/inspections">Inspections</a>
            <a href="/applications">Applications</a>
            <a href="/vendors">Vendors</a>
          </nav>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
