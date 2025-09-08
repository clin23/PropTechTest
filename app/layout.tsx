import './globals.css';
import type { ReactNode } from 'react';
import Providers from './providers';
import Sidebar from '../components/Sidebar';

export const metadata = { title: 'PropTech' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-200">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
