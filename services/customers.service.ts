import api from '@/lib/api';

export type Customer = {
  id: string;
  shopId: string;
  name: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerPayload = {
  name: string;
  phone?: string;
  address?: string;
};

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await api.get<Customer[]>('/customers');

  return response.data;
};

export const createCustomer = async (
  payload: CreateCustomerPayload,
): Promise<Customer> => {
  const response = await api.post<Customer>(
    '/customers',
    payload,
  );

  return response.data;
};

export const deleteCustomer = async (
  id: string,
): Promise<void> => {
  await api.delete(`/customers/${id}`);
};

export type UpdateCustomerPayload = {
  name: string;
  phone?: string;
  address?: string;
};

export const updateCustomer = async (
  id: string,
  payload: UpdateCustomerPayload,
): Promise<Customer> => {
  const response = await api.patch<Customer>(
    `/customers/${id}`,
    payload,
  );

  return response.data;
};