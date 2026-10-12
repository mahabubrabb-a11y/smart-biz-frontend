'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createPurchase,
  getPurchases,
  Purchase,
} from '@/services/purchases.service';

import {
  getSuppliers,
  Supplier,
} from '@/services/suppliers.service';

import {
  getProducts,
  Product,
} from '@/services/products.service';

type PurchaseItemForm = {
  productId: string;
  quantity: number;
  costPrice: number;
};

export default function PurchasesPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const [supplierId, setSupplierId] = useState('');
  const [paidAmount, setPaidAmount] = useState(0);

  const [items, setItems] = useState<PurchaseItemForm[]>([
    {
      productId: '',
      quantity: 1,
      costPrice: 0,
    },
  ]);

  // =========================
  // Queries
  // =========================

  const purchasesQuery = useQuery({
    queryKey: ['purchases'],
    queryFn: getPurchases,
  });

  const suppliersQuery = useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers,
  });

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  // =========================
  // Create Purchase
  // =========================

  const createMutation = useMutation({
    mutationFn: createPurchase,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['purchases'],
      });

      queryClient.invalidateQueries({
        queryKey: ['products'],
      });

      setSupplierId('');
      setPaidAmount(0);

      setItems([
        {
          productId: '',
          quantity: 1,
          costPrice: 0,
        },
      ]);

      setShowForm(false);
    },
  });

  // =========================
  // Loading
  // =========================

  if (
    purchasesQuery.isLoading ||
    suppliersQuery.isLoading ||
    productsQuery.isLoading
  ) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <p className="text-sm text-slate-500">
            Loading purchases...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // Error
  // =========================

  if (
    purchasesQuery.isError ||
    suppliersQuery.isError ||
    productsQuery.isError
  ) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8">
          <p className="text-sm text-red-600">
            Failed to load purchase data.
          </p>
        </div>
      </div>
    );
  }

  const purchases = purchasesQuery.data ?? [];
  const suppliers = suppliersQuery.data ?? [];
  const products = productsQuery.data ?? [];

  // =========================
  // Maps
  // =========================

  const supplierMap = new Map(
    suppliers.map((supplier) => [
      supplier.id,
      supplier,
    ]),
  );

  const productMap = new Map(
    products.map((product) => [
      product.id,
      product,
    ]),
  );

  // =========================
  // Search
  // =========================

  const filteredPurchases = purchases.filter(
    (purchase) => {
      const supplier = supplierMap.get(
        purchase.supplierId,
      );

      const supplierName =
        supplier?.name?.toLowerCase() ?? '';

      const purchaseId =
        purchase.id.toLowerCase();

      const searchText =
        search.toLowerCase().trim();

      return (
        supplierName.includes(searchText) ||
        purchaseId.includes(searchText)
      );
    },
  );

  // =========================
  // Purchase Total
  // =========================

  const purchaseTotal = items.reduce(
    (total, item) => {
      return (
        total +
        item.quantity * item.costPrice
      );
    },
    0,
  );

  const dueAmount =
    Math.max(
      purchaseTotal - paidAmount,
      0,
    );

  // =========================
  // Add Item
  // =========================

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        productId: '',
        quantity: 1,
        costPrice: 0,
      },
    ]);
  };

  // =========================
  // Remove Item
  // =========================

  const removeItem = (index: number) => {
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        return currentItems;
      }

      return currentItems.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      );
    });
  };

  // =========================
  // Product Change
  // =========================

  const handleProductChange = (
    index: number,
    productId: string,
  ) => {
    const selectedProduct =
      productMap.get(productId);

    setItems((currentItems) =>
      currentItems.map(
        (item, itemIndex) => {
          if (itemIndex !== index) {
            return item;
          }

          return {
            ...item,
            productId,
            costPrice:
              selectedProduct?.costPrice ?? 0,
          };
        },
      ),
    );
  };

  // =========================
  // Quantity Change
  // =========================

  const handleQuantityChange = (
    index: number,
    quantity: number,
  ) => {
    setItems((currentItems) =>
      currentItems.map(
        (item, itemIndex) => {
          if (itemIndex !== index) {
            return item;
          }

          return {
            ...item,
            quantity,
          };
        },
      ),
    );
  };

  // =========================
  // Cost Price Change
  // =========================

  const handleCostPriceChange = (
    index: number,
    costPrice: number,
  ) => {
    setItems((currentItems) =>
      currentItems.map(
        (item, itemIndex) => {
          if (itemIndex !== index) {
            return item;
          }

          return {
            ...item,
            costPrice,
          };
        },
      ),
    );
  };

  // =========================
  // Submit Purchase
  // =========================

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!supplierId) {
      alert('Please select a supplier.');
      return;
    }

    const invalidItem = items.some(
      (item) =>
        !item.productId ||
        item.quantity <= 0 ||
        item.costPrice < 0,
    );

    if (invalidItem) {
      alert(
        'Please select valid products, quantities and cost prices.',
      );
      return;
    }

    if (paidAmount < 0) {
      alert(
        'Paid amount cannot be negative.',
      );
      return;
    }

    if (paidAmount > purchaseTotal) {
      alert(
        'Paid amount cannot be greater than purchase total.',
      );
      return;
    }

    createMutation.mutate({
      supplierId,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        costPrice: item.costPrice,
      })),
      paidAmount,
    });
  };

  // =========================
  // Status
  // =========================

  const renderStatus = (
    purchase: Purchase,
  ) => {
    if (purchase.status === 'paid') {
      return (
        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          Paid
        </span>
      );
    }

    if (purchase.status === 'partial') {
      return (
        <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
          Partial
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
        Unpaid
      </span>
    );
  };

  return (
    <div className="p-8">
      {/* =========================
          Header
      ========================= */}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Purchases
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage purchases, supplier dues and stock.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowForm((current) => !current)
          }
          className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {showForm
            ? 'Close Form'
            : 'Add Purchase'}
        </button>
      </div>

      {/* =========================
          Create Purchase Form
      ========================= */}

      {showForm && (
        <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Create Purchase
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add products purchased from a supplier.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6"
          >
            {/* Supplier */}

            <div className="mb-6 max-w-md">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Supplier
              </label>

              <select
                value={supplierId}
                onChange={(event) =>
                  setSupplierId(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="">
                  Select supplier
                </option>

                {suppliers.map(
                  (supplier) => (
                    <option
                      key={supplier.id}
                      value={supplier.id}
                    >
                      {supplier.name}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Items */}

            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Purchase Items
                </h3>

                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  + Add Item
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Product
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Quantity
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Cost Price
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Total
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {items.map(
                      (item, index) => (
                        <tr key={index}>
                          {/* Product */}

                          <td className="px-4 py-4">
                            <select
                              value={
                                item.productId
                              }
                              onChange={(
                                event,
                              ) =>
                                handleProductChange(
                                  index,
                                  event.target
                                    .value,
                                )
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                            >
                              <option value="">
                                Select product
                              </option>

                              {products
                                .filter(
                                  (
                                    product,
                                  ) =>
                                    product.isActive,
                                )
                                .map(
                                  (
                                    product,
                                  ) => (
                                    <option
                                      key={
                                        product.id
                                      }
                                      value={
                                        product.id
                                      }
                                    >
                                      {
                                        product.name
                                      }{' '}
                                      (
                                      {
                                        product.sku
                                      }
                                      )
                                    </option>
                                  ),
                                )}
                            </select>
                          </td>

                          {/* Quantity */}

                          <td className="px-4 py-4">
                            <input
                              type="number"
                              min="1"
                              value={
                                item.quantity
                              }
                              onChange={(
                                event,
                              ) =>
                                handleQuantityChange(
                                  index,
                                  Number(
                                    event.target
                                      .value,
                                  ),
                                )
                              }
                              className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                            />
                          </td>

                          {/* Cost Price */}

                          <td className="px-4 py-4">
                            <input
                              type="number"
                              min="0"
                              value={
                                item.costPrice
                              }
                              onChange={(
                                event,
                              ) =>
                                handleCostPriceChange(
                                  index,
                                  Number(
                                    event.target
                                      .value,
                                  ),
                                )
                              }
                              className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                            />
                          </td>

                          {/* Total */}

                          <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900">
                            ৳
                            {(
                              item.quantity *
                              item.costPrice
                            ).toLocaleString()}
                          </td>

                          {/* Remove */}

                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                removeItem(
                                  index,
                                )
                              }
                              disabled={
                                items.length ===
                                1
                              }
                              className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}

            <div className="ml-auto max-w-md rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Purchase Total
                </span>

                <span className="font-semibold text-slate-900">
                  ৳
                  {purchaseTotal.toLocaleString()}
                </span>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Paid Amount
                </label>

                <input
                  type="number"
                  min="0"
                  max={purchaseTotal}
                  value={paidAmount}
                  onChange={(event) =>
                    setPaidAmount(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    Supplier Due
                  </span>

                  <span className="text-lg font-bold text-red-600">
                    ৳
                    {dueAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  createMutation.isPending
                }
                className="mt-5 w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createMutation.isPending
                  ? 'Creating...'
                  : 'Create Purchase'}
              </button>

              {createMutation.isError && (
                <p className="mt-3 text-sm text-red-600">
                  Failed to create purchase.
                </p>
              )}
            </div>
          </form>
        </div>
      )}

      {/* =========================
          Search
      ========================= */}

      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by supplier or purchase ID..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
        />
      </div>

      {/* =========================
          Purchase List
      ========================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Purchase List
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredPurchases.length}{' '}
            purchase
            {filteredPurchases.length !==
            1
              ? 's'
              : ''}
          </p>
        </div>

        {filteredPurchases.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-500">
              No purchases found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Supplier
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Paid
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Due
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPurchases.map(
                  (purchase) => {
                    const supplier =
                      supplierMap.get(
                        purchase.supplierId,
                      );

                    return (
                      <tr
                        key={purchase.id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* Supplier */}

                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">
                            {supplier?.name ||
                              'Unknown Supplier'}
                          </p>

                          {supplier?.phone && (
                            <p className="mt-1 text-xs text-slate-500">
                              {supplier.phone}
                            </p>
                          )}
                        </td>

                        {/* Date */}

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(
                            purchase.createdAt,
                          ).toLocaleDateString()}
                        </td>

                        {/* Total */}

                        <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                          ৳
                          {purchase.totalAmount.toLocaleString()}
                        </td>

                        {/* Paid */}

                        <td className="px-6 py-4 text-right text-sm text-green-600">
                          ৳
                          {purchase.paidAmount.toLocaleString()}
                        </td>

                        {/* Due */}

                        <td className="px-6 py-4 text-right text-sm font-semibold text-red-600">
                          ৳
                          {purchase.dueAmount.toLocaleString()}
                        </td>

                        {/* Status */}

                        <td className="px-6 py-4 text-center">
                          {renderStatus(
                            purchase,
                          )}
                        </td>

                        {/* Action */}

                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/purchases/${purchase.id}`}
                            className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}