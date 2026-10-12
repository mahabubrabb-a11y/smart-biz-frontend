'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { getSales, type Sale } from '@/services/sales.service';
import { getCustomers, type Customer } from '@/services/customers.service';

export default function SalesHistoryPage() {
  const {
    data: sales = [],
    isLoading: salesLoading,
    isError: salesError,
  } = useQuery<Sale[]>({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  const {
    data: customers = [],
    isLoading: customersLoading,
  } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const getCustomerName = (customerId: string | null) => {
    if (!customerId) {
      return 'Walk-in Customer';
    }

    const customer = customers.find(
      (item) => item.id === customerId,
    );

    return customer?.name ?? 'Unknown Customer';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  if (salesLoading || customersLoading) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-500">
          Loading sales...
        </p>
      </div>
    );
  }

  if (salesError) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            Failed to load sales.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sales History
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View all completed sales and their details.
          </p>
        </div>

        <Link
          href="/sales"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          New Sale
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Paid
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Due
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No sales found.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {getCustomerName(sale.customerId)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        #{sale.id.slice(0, 8)}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatDate(sale.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      ৳{sale.totalAmount.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-sm text-green-600">
                      ৳{sale.paidAmount.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-sm text-red-600">
                      ৳{sale.dueAmount.toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          sale.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : sale.paymentStatus === 'partial'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {sale.paymentStatus}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/sales/${sale.id}`}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}