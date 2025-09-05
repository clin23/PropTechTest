import './globals.css';
import type { ReactNode } from 'react';
import Providers from './providers';
import Sidebar from '../components/Sidebar';

export const metadata = { title: 'PropTech' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Providers>
          <Sidebar />
          <main className="md:ml-64">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
