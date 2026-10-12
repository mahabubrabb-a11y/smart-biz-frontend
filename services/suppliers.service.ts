import api from '@/lib/api';

export type Supplier = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
};

export type CreateSupplierPayload = {
  name: string;
  phone?: string;
  address?: string;
};

export const getSuppliers = async (): Promise<Supplier[]> => {
  const response = await api.get<Supplier[]>('/suppliers');

  return response.data;
};

export const createSupplier = async (
  payload: CreateSupplierPayload,
): Promise<Supplier> => {
  const response = await api.post<Supplier>(
    '/suppliers',
    payload,
  );

  return response.data;
};

export const deleteSupplier = async (
  id: string,
): Promise<void> => {
  await api.delete(`/suppliers/${id}`);
};