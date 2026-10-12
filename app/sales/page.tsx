'use client';

import { useMemo, useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createSale,
  SalePaymentMethod,
} from '@/services/sales.service';

import {
  getProducts,
  Product,
} from '@/services/products.service';

import {
  getCustomers,
  Customer,
} from '@/services/customers.service';

type CartItem = {
  productId: string;
  quantity: number;
};

const paymentMethods: {
  value: SalePaymentMethod;
  label: string;
}[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bkash', label: 'bKash' },
  { value: 'nagad', label: 'Nagad' },
  { value: 'bank', label: 'Bank' },
  { value: 'other', label: 'Other' },
];

export default function SalesPage() {
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] =
    useState('');

  const [selectedProductId, setSelectedProductId] =
    useState('');

  const [quantity, setQuantity] = useState(1);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [paidAmount, setPaidAmount] =
    useState<number>(0);

  const [paymentMethod, setPaymentMethod] =
    useState<SalePaymentMethod | ''>('');

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const createMutation = useMutation({
    mutationFn: createSale,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sales'],
      });

      queryClient.invalidateQueries({
        queryKey: ['products'],
      });

      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });

      setCustomerId('');
      setCart([]);
      setSelectedProductId('');
      setQuantity(1);
      setPaidAmount(0);
      setPaymentMethod('');
    },
  });

  const products = productsQuery.data ?? [];
  const customers = customersQuery.data ?? [];

  const activeProducts = products.filter(
    (product) => product.isActive,
  );

  const selectedProduct = products.find(
    (product) =>
      product.id === selectedProductId,
  );

  const cartDetails = useMemo(() => {
    return cart.map((item) => {
      const product = products.find(
        (product) =>
          product.id === item.productId,
      );

      return {
        ...item,
        product,
        lineTotal: product
          ? product.price * item.quantity
          : 0,
      };
    });
  }, [cart, products]);

  const totalAmount = cartDetails.reduce(
    (sum, item) => sum + item.lineTotal,
    0,
  );

  const dueAmount = Math.max(
    totalAmount - paidAmount,
    0,
  );

  const addToCart = () => {
    if (!selectedProduct) {
      return;
    }

    if (quantity <= 0) {
      return;
    }

    if (quantity > selectedProduct.stock) {
      alert('Insufficient stock.');

      return;
    }

    const existingItem = cart.find(
      (item) =>
        item.productId ===
        selectedProduct.id,
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + quantity;

      if (newQuantity > selectedProduct.stock) {
        alert('Insufficient stock.');

        return;
      }

      setCart((currentCart) =>
        currentCart.map((item) =>
          item.productId ===
          selectedProduct.id
            ? {
                ...item,
                quantity: newQuantity,
              }
            : item,
        ),
      );
    } else {
      setCart((currentCart) => [
        ...currentCart,
        {
          productId: selectedProduct.id,
          quantity,
        },
      ]);
    }

    setSelectedProductId('');
    setQuantity(1);
  };

  const updateCartQuantity = (
    productId: string,
    newQuantity: number,
  ) => {
    const product = products.find(
      (item) => item.id === productId,
    );

    if (!product) {
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(productId);

      return;
    }

    if (newQuantity > product.stock) {
      alert('Insufficient stock.');

      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item,
      ),
    );
  };

  const removeFromCart = (
    productId: string,
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.productId !== productId,
      ),
    );
  };

  const handlePaidAmountChange = (
    value: number,
  ) => {
    if (value < 0) {
      setPaidAmount(0);

      return;
    }

    if (value > totalAmount) {
      setPaidAmount(totalAmount);

      return;
    }

    setPaidAmount(value);
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!cart.length) {
      alert('Please add at least one product.');

      return;
    }

    if (
      paidAmount > 0 &&
      !paymentMethod
    ) {
      alert(
        'Please select a payment method.',
      );

      return;
    }

    createMutation.mutate({
      customerId:
        customerId || undefined,

      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),

      paidAmount:
        paidAmount > 0
          ? paidAmount
          : undefined,

      paymentMethod:
        paidAmount > 0
          ? paymentMethod || undefined
          : undefined,
    });
  };

  if (
    productsQuery.isLoading ||
    customersQuery.isLoading
  ) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-500">
          Loading POS...
        </p>
      </div>
    );
  }

  if (
    productsQuery.isError ||
    customersQuery.isError
  ) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">
          Failed to load POS data.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Sales / POS
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a new sale and manage your cart.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* LEFT SIDE */}

          <div className="space-y-6 xl:col-span-2">
            {/* Customer */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-slate-900">
                Customer
              </h2>

              <select
                value={customerId}
                onChange={(event) =>
                  setCustomerId(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              >
                <option value="">
                  Walk-in Customer
                </option>

                {customers
                  .filter(
                    (customer) =>
                      customer.isActive,
                  )
                  .map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                      {customer.phone
                        ? ` - ${customer.phone}`
                        : ''}
                    </option>
                  ))}
              </select>
            </div>

            {/* Add Product */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-slate-900">
                Add Product
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Product
                  </label>

                  <select
                    value={selectedProductId}
                    onChange={(event) =>
                      setSelectedProductId(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  >
                    <option value="">
                      Select product
                    </option>

                    {activeProducts.map(
                      (product) => (
                        <option
                          key={product.id}
                          value={product.id}
                          disabled={
                            product.stock <= 0
                          }
                        >
                          {product.name} — ৳
                          {product.price.toLocaleString()}
                          {' | Stock: '}
                          {product.stock}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={
                      selectedProduct?.stock ??
                      undefined
                    }
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              {selectedProduct && (
                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Selling Price
                    </span>

                    <span className="font-semibold text-slate-900">
                      ৳
                      {selectedProduct.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Available Stock
                    </span>

                    <span className="font-semibold text-slate-900">
                      {selectedProduct.stock}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={addToCart}
                disabled={!selectedProduct}
                className="mt-5 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add to Cart
              </button>
            </div>

            {/* Cart */}

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  Cart
                </h2>
              </div>

              {cartDetails.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm text-slate-500">
                    No products added yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Product
                        </th>

                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Price
                        </th>

                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Qty
                        </th>

                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Total
                        </th>

                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {cartDetails.map((item) => (
                        <tr key={item.productId}>
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900">
                              {item.product?.name ??
                                'Unknown Product'}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.product?.sku ??
                                ''}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-right text-sm text-slate-600">
                            ৳
                            {item.product?.price.toLocaleString() ??
                              '0'}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <input
                              type="number"
                              min={1}
                              max={
                                item.product
                                  ?.stock
                              }
                              value={item.quantity}
                              onChange={(event) =>
                                updateCartQuantity(
                                  item.productId,
                                  Number(
                                    event.target
                                      .value,
                                  ),
                                )
                              }
                              className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm outline-none focus:border-slate-500"
                            />
                          </td>

                          <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                            ৳
                            {item.lineTotal.toLocaleString()}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(
                                  item.productId,
                                )
                              }
                              className="text-sm font-medium text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="space-y-6">
            {/* Payment */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-slate-900">
                Payment
              </h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Paid Amount
                </label>

                <input
                  type="number"
                  min={0}
                  max={totalAmount}
                  value={paidAmount}
                  onChange={(event) =>
                    handlePaidAmountChange(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target
                        .value as SalePaymentMethod,
                    )
                  }
                  disabled={paidAmount <= 0}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100"
                >
                  <option value="">
                    Select payment method
                  </option>

                  {paymentMethods.map(
                    (method) => (
                      <option
                        key={method.value}
                        value={method.value}
                      >
                        {method.label}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            {/* Summary */}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-slate-900">
                Sale Summary
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Items
                  </span>

                  <span className="font-medium text-slate-900">
                    {cart.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Total
                  </span>

                  <span className="text-lg font-bold text-slate-900">
                    ৳
                    {totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Paid
                  </span>

                  <span className="font-semibold text-green-600">
                    ৳
                    {paidAmount.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">
                      Due
                    </span>

                    <span className="text-xl font-bold text-red-600">
                      ৳
                      {dueAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  cart.length === 0 ||
                  (paidAmount > 0 &&
                    !paymentMethod)
                }
                className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createMutation.isPending
                  ? 'Creating Sale...'
                  : 'Complete Sale'}
              </button>

              {createMutation.isError && (
                <p className="mt-4 text-sm text-red-600">
                  Failed to create sale. Please
                  check stock and payment details.
                </p>
              )}

              {createMutation.isSuccess && (
                <p className="mt-4 text-sm font-medium text-green-600">
                  Sale created successfully.
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}