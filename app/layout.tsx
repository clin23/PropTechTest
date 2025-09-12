import './globals.css';
import type { ReactNode } from 'react';
import Providers from './providers';
import Sidebar from '../components/Sidebar';
import TitleUpdater from '../components/TitleUpdater';

export const metadata = { title: 'PropTech' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-200">
        <Providers>
          <TitleUpdater />
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
