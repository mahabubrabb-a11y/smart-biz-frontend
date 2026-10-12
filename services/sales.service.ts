import api from '@/lib/api';

export type SalePaymentMethod =
  | 'cash'
  | 'card'
  | 'bkash'
  | 'nagad'
  | 'bank'
  | 'other';

export type SaleItemPayload = {
  productId: string;
  quantity: number;
};

export type CreateSalePayload = {
  customerId?: string;
  items: SaleItemPayload[];
  paidAmount?: number;
  paymentMethod?: SalePaymentMethod;
};

export type Sale = {
  id: string;
  shopId: string;
  customerId: string | null;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  createdAt: string;
  updatedAt: string;
};

export type SaleItem = {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  price: number;
  costPrice: number;
  total: number;
};

export type SaleDetails = {
  sale: Sale;
  items: SaleItem[];
};

export const getSales = async (): Promise<Sale[]> => {
  const response = await api.get<Sale[]>('/sales');

  return response.data;
};

export const createSale = async (
  payload: CreateSalePayload,
): Promise<SaleDetails> => {
  const response = await api.post<SaleDetails>(
    '/sales',
    payload,
  );

  return response.data;
};

export const getSale = async (
  id: string,
): Promise<SaleDetails> => {
  const response = await api.get<SaleDetails>(
    `/sales/${id}`,
  );

  return response.data;
};