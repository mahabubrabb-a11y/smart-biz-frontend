'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from '@/services/customers.service';

import type { Customer } from '@/services/customers.service';

export default function CustomersPage() {
  const queryClient = useQueryClient();

  // Add customer form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Search
  const [search, setSearch] = useState('');

  // Edit customer
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // =========================
  // Get Customers
  // =========================

  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  // =========================
  // Create Customer
  // =========================

  const createMutation = useMutation({
    mutationFn: createCustomer,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customers'],
      });

      setName('');
      setPhone('');
      setAddress('');
    },
  });

  // =========================
  // Update Customer
  // =========================

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      name,
      phone,
      address,
    }: {
      id: string;
      name: string;
      phone?: string;
      address?: string;
    }) =>
      updateCustomer(id, {
        name,
        phone,
        address,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customers'],
      });

      setEditingCustomer(null);
      setEditName('');
      setEditPhone('');
      setEditAddress('');
    },
  });

  // =========================
  // Delete Customer
  // =========================

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customers'],
      });
    },
  });

  const customers = customersQuery.data ?? [];

  // =========================
  // Search
  // =========================

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(keyword) ||
        customer.phone?.toLowerCase().includes(keyword) ||
        customer.address?.toLowerCase().includes(keyword)
      );
    });
  }, [customers, search]);

  // =========================
  // Add Customer
  // =========================

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    });
  };

  // =========================
  // Start Edit
  // =========================

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);

    setEditName(customer.name);
    setEditPhone(customer.phone ?? '');
    setEditAddress(customer.address ?? '');
  };

  // =========================
  // Update Customer
  // =========================

  const handleUpdate = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!editingCustomer || !editName.trim()) {
      return;
    }

    updateMutation.mutate({
      id: editingCustomer.id,
      name: editName.trim(),
      phone: editPhone.trim() || undefined,
      address: editAddress.trim() || undefined,
    });
  };

  // =========================
  // Cancel Edit
  // =========================

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setEditName('');
    setEditPhone('');
    setEditAddress('');
  };

  // =========================
  // Delete
  // =========================

  const handleDelete = (
    id: string,
    customerName: string,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${customerName}"?`,
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(id);
  };

  // =========================
  // Loading
  // =========================

  if (customersQuery.isLoading) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-500">
          Loading customers...
        </p>
      </div>
    );
  }

  // =========================
  // Error
  // =========================

  if (customersQuery.isError) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">
          Failed to load customers.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Customers
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your shop customers.
        </p>
      </div>

      {/* Add Customer */}

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Add Customer
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-4"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Customer name"
              maxLength={150}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Phone
            </label>

            <input
              type="text"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="017XXXXXXXX"
              maxLength={20}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Address
            </label>

            <input
              type="text"
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
              placeholder="Customer address"
              maxLength={255}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                !name.trim()
              }
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createMutation.isPending
                ? 'Adding...'
                : 'Add Customer'}
            </button>
          </div>
        </form>

        {createMutation.isError && (
          <p className="mt-4 text-sm text-red-600">
            Failed to add customer.
          </p>
        )}

        {createMutation.isSuccess && (
          <p className="mt-4 text-sm text-green-600">
            Customer added successfully.
          </p>
        )}
      </div>

      {/* Edit Customer */}

      {editingCustomer && (
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Edit Customer
          </h2>

          <form
            onSubmit={handleUpdate}
            className="grid grid-cols-1 gap-4 md:grid-cols-4"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Name
              </label>

              <input
                type="text"
                value={editName}
                onChange={(event) =>
                  setEditName(event.target.value)
                }
                maxLength={150}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone
              </label>

              <input
                type="text"
                value={editPhone}
                onChange={(event) =>
                  setEditPhone(event.target.value)
                }
                maxLength={20}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Address
              </label>

              <input
                type="text"
                value={editAddress}
                onChange={(event) =>
                  setEditAddress(event.target.value)
                }
                maxLength={255}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={
                  updateMutation.isPending ||
                  !editName.trim()
                }
                className="flex-1 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateMutation.isPending
                  ? 'Saving...'
                  : 'Save'}
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>

          {updateMutation.isError && (
            <p className="mt-4 text-sm text-red-600">
              Failed to update customer.
            </p>
          )}
        </div>
      )}

      {/* Customer List */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Search */}

        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Customer List
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredCustomers.length} customer
              {filteredCustomers.length !== 1
                ? 's'
                : ''}
            </p>
          </div>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search customer..."
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 md:w-80"
          />
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Address
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">
                      {customer.name}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {customer.phone || '—'}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {customer.address || '—'}
                  </td>

                  <td className="px-6 py-4">
                    {customer.isActive ? (
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(customer)
                        }
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            customer.id,
                            customer.name,
                          )
                        }
                        disabled={
                          deleteMutation.isPending
                        }
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center"
                  >
                    <p className="text-sm text-slate-500">
                      No customers found.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}