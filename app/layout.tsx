import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/sidebar';
import QueryProvider from '@/providers/query-provider';

export const metadata: Metadata = {
  title: 'SmartBiz',
  description: 'Shop Management & Business Analytics',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased">
        <QueryProvider>
          <Sidebar />

          <main className="min-h-screen pl-64">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}