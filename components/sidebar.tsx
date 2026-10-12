import Link from 'next/link';

import LogoutButton from './logout-button';

const menuItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Products', href: '/products' },
  { label: 'Suppliers', href: '/suppliers' },
  { label: 'Purchases', href: '/purchases' },
  { label: 'Sales', href: '/sales' },
  { label: 'Sales History', href: '/sales/history' },
  { label: 'Customers', href: '/customers' },
  { label: 'Invoices', href: '/invoices' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r bg-white">
      <div className="border-b px-6 py-5">
        <h1 className="text-xl font-bold text-slate-900">
          SmartBiz
        </h1>

        <p className="mt-1 text-xs text-slate-500">
          Shop Management
        </p>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="space-y-1 border-t p-4">
        <Link
          href="/settings"
          className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Settings
        </Link>

        <LogoutButton />
      </div>
    </aside>
  );
}