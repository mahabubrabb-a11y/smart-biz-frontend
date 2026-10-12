'use client';

import { FormEvent, useState } from 'react';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  type CreateSupplierPayload,
} from '@/services/suppliers.service';

export default function SuppliersPage() {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: suppliers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateSupplierPayload) =>
      createSupplier(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['suppliers'],
      });

      setName('');
      setPhone('');
      setAddress('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSupplier(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['suppliers'],
      });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this supplier?',
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(id);
  };

  const search = searchTerm.trim().toLowerCase();

  const filteredSuppliers = !search
    ? suppliers
    : suppliers.filter((supplier) => {
        return (
          supplier.name
            .toLowerCase()
            .includes(search) ||
          supplier.phone
            ?.toLowerCase()
            .includes(search) ||
          supplier.address
            ?.toLowerCase()
            .includes(search)
        );
      });

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Suppliers
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your shop suppliers
        </p>
      </div>

      {/* Add Supplier */}
      <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Add Supplier
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-3"
        >
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Supplier Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter supplier name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Phone
            </label>

            <input
              type="text"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="017XXXXXXXX"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Address
            </label>

            <input
              type="text"
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
              placeholder="Supplier address"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
            />
          </div>

          {/* Button */}
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createMutation.isPending
                ? 'Adding...'
                : 'Add Supplier'}
            </button>
          </div>
        </form>

        {createMutation.isError && (
          <p className="mt-4 text-sm text-red-600">
            Failed to add supplier. Please try again.
          </p>
        )}
      </div>

      {/* Supplier List */}
      <div className="rounded-xl border bg-white shadow-sm">
        {/* List Header */}
        <div className="flex flex-col gap-4 border-b p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Supplier List
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredSuppliers.length} supplier
              {filteredSuppliers.length !== 1
                ? 's'
                : ''}
            </p>
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search supplier..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 md:w-80"
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading suppliers...
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="p-8 text-center text-sm text-red-600">
            Failed to load suppliers.
          </div>
        )}

        {/* Empty */}
        {!isLoading &&
          !isError &&
          filteredSuppliers.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-500">
                No suppliers found.
              </p>
            </div>
          )}

        {/* Table */}
        {!isLoading &&
          !isError &&
          filteredSuppliers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Name
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Address
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredSuppliers.map(
                    (supplier) => (
                      <tr
                        key={supplier.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {supplier.name}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {supplier.phone || '-'}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {supplier.address || '-'}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              supplier.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {supplier.isActive
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                supplier.id,
                              )
                            }
                            disabled={
                              deleteMutation.isPending
                            }
                            className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}