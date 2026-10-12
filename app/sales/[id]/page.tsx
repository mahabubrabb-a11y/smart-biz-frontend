'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import {
  getSale,
  type SaleDetails,
} from '@/services/sales.service';

import {
  getCustomers,
  type Customer,
} from '@/services/customers.service';

import {
  getProducts,
  type Product,
} from '@/services/products.service';

import { initSslcommerzPayment } from '@/services/payments.service';

export default function SaleDetailsPage() {
  const params = useParams();
  const saleId = params.id as string;

  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // =====================================================
  // Sale
  // =====================================================

  const {
    data: saleDetails,
    isLoading: saleLoading,
    isError: saleError,
  } = useQuery<SaleDetails>({
    queryKey: ['sale', saleId],
    queryFn: () => getSale(saleId),
    enabled: Boolean(saleId),
  });

  // =====================================================
  // Customers
  // =====================================================

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  // =====================================================
  // Products
  // =====================================================

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  // =====================================================
  // Loading
  // =====================================================

  if (saleLoading) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-500">
          Loading sale details...
        </p>
      </div>
    );
  }

  // =====================================================
  // Error
  // =====================================================

  if (saleError || !saleDetails) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            Failed to load sale details.
          </p>

          <Link
            href="/sales/history"
            className="mt-3 inline-block text-sm font-medium text-red-700 underline"
          >
            Back to Sales History
          </Link>
        </div>
      </div>
    );
  }

  const { sale, items } = saleDetails;

  // =====================================================
  // Customer
  // =====================================================

  const customer = sale.customerId
    ? customers.find(
        (item) => item.id === sale.customerId,
      )
    : null;

  // =====================================================
  // Product Name
  // =====================================================

  const getProductName = (
    productId: string,
  ) => {
    const product = products.find(
      (item) => item.id === productId,
    );

    return product?.name ?? 'Unknown Product';
  };

  // =====================================================
  // Date
  // =====================================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // =====================================================
  // SSLCommerz Payment
  // =====================================================

  const handleOnlinePayment = async () => {
    if (sale.dueAmount <= 0) {
      return;
    }

    try {
      setIsPaying(true);
      setPaymentError('');

      const result =
        await initSslcommerzPayment({
          saleId: sale.id,

          customerName:
            customer?.name ??
            'SmartBiz Customer',

          customerEmail:
            undefined,

          customerPhone:
            customer?.phone ??
            undefined,

          customerAddress:
            customer?.address ??
            undefined,
        });

      /*
       * Redirect customer to SSLCommerz
       * hosted payment page.
       */
      window.location.href =
        result.gatewayPageURL;
    } catch (error) {
      console.error(
        'SSLCommerz payment error:',
        error,
      );

      setPaymentError(
        'Unable to start online payment. Please try again.',
      );

      setIsPaying(false);
    }
  };

  return (
    <div className="p-8">

      {/* =================================================
          Header
      ================================================= */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sale Details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Sale #{sale.id.slice(0, 8)}
          </p>
        </div>

        <Link
          href="/sales/history"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          ← Sales History
        </Link>

      </div>

      {/* =================================================
          Sale Information + Payment Summary
      ================================================= */}

      <div className="mb-6 grid gap-6 md:grid-cols-2">

        {/* Sale Information */}

        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Sale Information
          </h2>

          <div className="space-y-3">

            <div className="flex justify-between gap-4">

              <span className="text-sm text-slate-500">
                Sale ID
              </span>

              <span className="text-right text-sm font-medium text-slate-900">
                {sale.id}
              </span>

            </div>

            <div className="flex justify-between gap-4">

              <span className="text-sm text-slate-500">
                Date
              </span>

              <span className="text-sm font-medium text-slate-900">
                {formatDate(sale.createdAt)}
              </span>

            </div>

            <div className="flex justify-between gap-4">

              <span className="text-sm text-slate-500">
                Customer
              </span>

              <span className="text-sm font-medium text-slate-900">
                {customer?.name ??
                  'Walk-in Customer'}
              </span>

            </div>

            {customer?.phone && (
              <div className="flex justify-between gap-4">

                <span className="text-sm text-slate-500">
                  Phone
                </span>

                <span className="text-sm font-medium text-slate-900">
                  {customer.phone}
                </span>

              </div>
            )}

          </div>
        </div>

        {/* Payment Summary */}

        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Payment Summary
          </h2>

          <div className="space-y-4">

            <div className="flex justify-between">

              <span className="text-sm text-slate-500">
                Total
              </span>

              <span className="font-semibold text-slate-900">
                ৳{sale.totalAmount.toLocaleString()}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-sm text-slate-500">
                Paid
              </span>

              <span className="font-semibold text-green-600">
                ৳{sale.paidAmount.toLocaleString()}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-sm text-slate-500">
                Due
              </span>

              <span className="font-semibold text-red-600">
                ৳{sale.dueAmount.toLocaleString()}
              </span>

            </div>

            <div className="border-t pt-4">

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-500">
                  Status
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    sale.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : sale.paymentStatus === 'partial'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {sale.paymentStatus}
                </span>

              </div>

            </div>

            {/* =================================================
                Online Payment
            ================================================= */}

            {sale.dueAmount > 0 && (
              <div className="border-t pt-4">

                <button
                  type="button"
                  onClick={handleOnlinePayment}
                  disabled={isPaying}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPaying
                    ? 'Redirecting to payment...'
                    : `Pay Due ৳${sale.dueAmount.toLocaleString()} Online`}
                </button>

                {paymentError && (
                  <p className="mt-2 text-sm text-red-600">
                    {paymentError}
                  </p>
                )}

                <p className="mt-2 text-center text-xs text-slate-400">
                  Secure payment powered by
                  SSLCommerz
                </p>

              </div>
            )}

          </div>
        </div>

      </div>

      {/* =================================================
          Sale Items
      ================================================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        <div className="border-b px-6 py-5">

          <h2 className="text-lg font-semibold text-slate-900">
            Sale Items
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Products included in this sale.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quantity
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Selling Price
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cost Price
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {items.map((item) => (

                <tr
                  key={item.id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-6 py-4">

                    <p className="font-medium text-slate-900">
                      {getProductName(
                        item.productId,
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      #{item.productId.slice(0, 8)}
                    </p>

                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.quantity}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    ৳{item.price.toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    ৳{item.costPrice.toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    ৳{item.total.toLocaleString()}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* =================================================
            Bottom Summary
        ================================================= */}

        <div className="border-t bg-slate-50 px-6 py-6">

          <div className="ml-auto max-w-sm space-y-3">

            <div className="flex justify-between text-sm">

              <span className="text-slate-500">
                Total
              </span>

              <span className="font-semibold text-slate-900">
                ৳{sale.totalAmount.toLocaleString()}
              </span>

            </div>

            <div className="flex justify-between text-sm">

              <span className="text-slate-500">
                Paid
              </span>

              <span className="font-semibold text-green-600">
                ৳{sale.paidAmount.toLocaleString()}
              </span>

            </div>

            <div className="flex justify-between border-t pt-3">

              <span className="font-medium text-slate-700">
                Due
              </span>

              <span className="text-lg font-bold text-red-600">
                ৳{sale.dueAmount.toLocaleString()}
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}