'use client';

import { useQuery } from '@tanstack/react-query';

import {
  getDashboard,
  type DashboardData,
} from '@/services/dashboard.service';

const formatCurrency = (value: number) => {
  return `৳${value.toLocaleString('en-BD')}`;
};

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Loading dashboard data...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="font-medium text-red-700">
            Failed to load dashboard data.
          </p>

          <p className="mt-1 text-sm text-red-600">
            Make sure the backend is running on port 3000.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Sales',
      value: formatCurrency(data.sales.total),
      description: 'Total sales amount',
    },
    {
      title: 'Paid',
      value: formatCurrency(data.sales.paid),
      description: 'Payments received',
    },
    {
      title: 'Customer Due',
      value: formatCurrency(data.sales.customerDue),
      description: 'Outstanding customer dues',
    },
    {
      title: 'Gross Profit',
      value: formatCurrency(data.profit.grossProfit),
      description: 'Revenue minus cost',
    },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Overview of your shop performance
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">
              {stat.title}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {stat.value}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* Sales + Inventory */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Sales Overview
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Today
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-900">
                {formatCurrency(data.sales.today)}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Paid
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-900">
                {formatCurrency(data.sales.paid)}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Customer Due
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-900">
                {formatCurrency(data.sales.customerDue)}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Revenue
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-900">
                {formatCurrency(data.profit.revenue)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Inventory
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Products
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-900">
                {data.inventory.totalProducts}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Total Stock
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-900">
                {data.inventory.totalStock}
              </p>
            </div>

            <div className="col-span-2 rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Low Stock Products
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-900">
                {data.inventory.lowStockProducts}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Purchases */}
      <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Purchase Summary
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Total Purchases
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatCurrency(data.purchases.total)}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Paid
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatCurrency(data.purchases.paid)}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Supplier Due
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatCurrency(data.purchases.supplierDue)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}