
'use client';

import { useMemo, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios from "axios";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  uploadProductImage,
} from '@/services/products.service';

import type { Product } from '@/services/products.service';

export default function ProductsPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  // Product form
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('');

  // Selected image and preview
  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  // Load products
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  // Create product
  const createMutation = useMutation({
    mutationFn: createProduct,
  });

  // Update product
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        name: string;
        sku: string;
        price: number;
        costPrice: number;
        stock: number;
      };
    }) => updateProduct(id, payload),
  });

  // Upload product image
  const uploadImageMutation = useMutation({
    mutationFn: ({
      id,
      image,
    }: {
      id: string;
      image: File;
    }) => uploadProductImage(id, image),
  });

  // Delete product
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['products'],
      });
    },

    onError: (error) => {
      console.error(error);
      alert('Failed to delete product.');
    },
  });

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadImageMutation.isPending;

  // Reset form
  const resetForm = () => {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setName('');
    setSku('');
    setPrice('');
    setCostPrice('');
    setStock('');

    setSelectedImage(null);
    setImagePreview(null);

    setEditingProduct(null);
    setShowForm(false);
  };

  // Open create form
  const handleAddProduct = () => {
    resetForm();
    setShowForm(true);
  };

  // Open edit form
  const handleEditProduct = (product: Product) => {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setEditingProduct(product);

    setName(product.name);
    setSku(product.sku);
    setPrice(String(product.price));
    setCostPrice(String(product.costPrice));
    setStock(String(product.stock));

    setSelectedImage(null);
    setImagePreview(null);

    setShowForm(true);
  };

  // Select image and create preview
  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a JPEG, PNG, WEBP, or GIF image.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must not exceed 5 MB.');
      event.target.value = '';
      return;
    }

    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Submit create/update form
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      alert('Product name is required.');
      return;
    }

    if (!sku.trim()) {
      alert('SKU is required.');
      return;
    }

    const sellingPrice = Number(price);
    const productCostPrice = Number(costPrice);
    const initialStock = Number(stock);

    if (
      price.trim() === '' ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice <= 0
    ) {
      alert('Selling price must be greater than 0.');
      return;
    }

    if (
      costPrice.trim() === '' ||
      !Number.isFinite(productCostPrice) ||
      productCostPrice <= 0
    ) {
      alert('Cost price must be greater than 0.');
      return;
    }

    if (
      stock.trim() === '' ||
      !Number.isFinite(initialStock) ||
      initialStock < 0
    ) {
      alert('Stock must be a valid non-negative number.');
      return;
    }

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      price: sellingPrice,
      costPrice: productCostPrice,
      stock: initialStock,
    };

    let savedProduct: Product;

    // Save product information first
    try {
      if (editingProduct) {
        savedProduct = await updateMutation.mutateAsync({
          id: editingProduct.id,
          payload,
        });
      } else {
        savedProduct = await createMutation.mutateAsync(
          payload,
        );
      }
    } catch (error: unknown) {
  if (axios.isAxiosError(error)) {
    console.error('Status:', error.response?.status);
    console.error('Backend error:', error.response?.data);

    alert(
      JSON.stringify(
        error.response?.data ?? error.message,
        null,
        2,
      ),
    );
  } else {
    console.error(error);
    alert('An unexpected error occurred.');
  }

      return;
    }

    // Upload the selected image after product creation/update
    if (selectedImage) {
      try {
        await uploadImageMutation.mutateAsync({
          id: savedProduct.id,
          image: selectedImage,
        });
      } catch (error) {
        console.error(error);

        await queryClient.invalidateQueries({
          queryKey: ['products'],
        });

        alert(
          'Product was saved, but the image upload failed. You can edit the product and try uploading the image again.',
        );

        resetForm();
        return;
      }
    }

    await queryClient.invalidateQueries({
      queryKey: ['products'],
    });

    resetForm();
  };

  // Delete product
  const handleDeleteProduct = async (
    product: Product,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(product.id);
    } catch (error) {
      console.error(error);
    }
  };

  // Filter products
  const products = productsQuery.data ?? [];

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && product.isActive) ||
        (statusFilter === 'inactive' && !product.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilter]);

  // Loading state
  if (productsQuery.isLoading) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-500">
          Loading products...
        </p>
      </div>
    );
  }

  // Error state
  if (productsQuery.isError) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">
          Failed to load products.
        </p>

        <button
          type="button"
          onClick={() => productsQuery.refetch()}
          className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your shop products and inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddProduct}
          className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          + Add Product
        </button>
      </div>

      {/* Search and filter */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label
              htmlFor="product-search"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Search Products
            </label>

            <input
              id="product-search"
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search by product name or SKU..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="w-full md:w-48">
            <label
              htmlFor="status-filter"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Status
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | 'all'
                    | 'active'
                    | 'inactive',
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">All Products</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Showing{' '}
          <span className="font-semibold text-slate-700">
            {filteredProducts.length}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-700">
            {products.length}
          </span>{' '}
          products
        </p>
      </div>

      {/* Create/edit form */}
      {showForm && (
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter product information and optionally select an image.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {/* Product name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Product Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Redmi Charger"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* SKU */}
            <div>
              <label
                htmlFor="sku"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                SKU
              </label>

              <input
                id="sku"
                type="text"
                value={sku}
                onChange={(event) => setSku(event.target.value)}
                placeholder="e.g. RED-CH-001"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm uppercase outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Selling price */}
            <div>
              <label
                htmlFor="price"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Selling Price (BDT)
              </label>

              <input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="1500"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Cost price */}
            <div>
              <label
                htmlFor="costPrice"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Cost Price (BDT)
              </label>

              <input
                id="costPrice"
                type="number"
                min="0.01"
                step="0.01"
                value={costPrice}
                onChange={(event) =>
                  setCostPrice(event.target.value)
                }
                placeholder="1000"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Initial stock */}
            <div>
              <label
                htmlFor="stock"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Initial Stock
              </label>

              <input
                id="stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                placeholder="10"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Image upload */}
            <div className="md:col-span-2">
              <label
                htmlFor="product-image"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Product Image
              </label>

              <div className="flex flex-col gap-4 rounded-xl border border-dashed border-slate-300 p-4 sm:flex-row sm:items-center">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {imagePreview || editingProduct?.imageUrl ? (
                    <img
                      src={
                        imagePreview ||
                        editingProduct?.imageUrl ||
                        ''
                      }
                      alt="Product preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="px-2 text-center text-xs text-slate-400">
                      No image selected
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <input
                    id="product-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    JPEG, PNG, WEBP or GIF. Maximum size: 5 MB.
                  </p>

                  {selectedImage && (
                    <p className="mt-2 break-all text-xs text-green-700">
                      Selected: {selectedImage.name}
                    </p>
                  )}

                  {editingProduct?.imageUrl && !selectedImage && (
                    <p className="mt-2 text-xs text-slate-500">
                      Current image will be kept unless you select a new one.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form buttons */}
            <div className="flex items-end justify-end gap-3 md:col-span-2">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Saving...'
                  : editingProduct
                    ? 'Update Product'
                    : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  SKU
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Selling Price
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cost Price
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stock
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center"
                  >
                    <p className="text-sm font-medium text-slate-700">
                      No products found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                   <div className="flex h-48 w-48 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">                  {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              loading="lazy"
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-slate-400">
                              No image
                            </span>
                          )}
                        </div>

                        <div className="font-medium text-slate-900">
                          {product.name}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.sku}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      ৳{product.price.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      ৳{product.costPrice.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.stock}
                    </td>

                    <td className="px-6 py-4">
                      {product.isActive ? (
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEditProduct(product)
                          }
                          disabled={isSubmitting || deleteMutation.isPending}
                          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteProduct(product)
                          }
                          disabled={isSubmitting || deleteMutation.isPending}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deleteMutation.isPending
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>
                      </div>
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
