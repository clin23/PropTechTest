import './globals.css';
import type { ReactNode } from 'react';
import Providers from './providers';
import Sidebar from '../components/Sidebar';
import TitleUpdater from '../components/TitleUpdater';
import { RouteTransitionProvider } from '../components/RouteProgress';

export const metadata = { title: 'PropTech' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-screen">
        <Providers>
          <RouteTransitionProvider>
            <TitleUpdater />
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto" data-scroll-container>
                {children}
              </main>
            </div>
          </RouteTransitionProvider>
        </Providers>
      </body>
    </html>
  );
}
