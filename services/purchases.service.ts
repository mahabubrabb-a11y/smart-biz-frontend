import api from '@/lib/api';

export type PurchaseItemPayload = {
  productId: string;
  quantity: number;
  costPrice: number;
};

export type CreatePurchasePayload = {
  supplierId: string;
  items: PurchaseItemPayload[];
  paidAmount?: number;
};

export type PurchaseItem = {
  id: string;
  purchaseId: string;
  productId: string;
  quantity: number;
  costPrice: number;
  total: number;
};

export type Purchase = {
  id: string;
  shopId: string;
  supplierId: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'unpaid' | 'partial' | 'paid';
  createdAt: string;
  updatedAt: string;
};

export type PurchaseDetails = {
  purchase: Purchase;
  items: PurchaseItem[];
};

export const getPurchases = async (): Promise<Purchase[]> => {
  const response = await api.get<Purchase[]>('/purchases');

  return response.data;
};

export const createPurchase = async (
  payload: CreatePurchasePayload,
): Promise<PurchaseDetails> => {
  const response = await api.post<PurchaseDetails>(
    '/purchases',
    payload,
  );

  return response.data;
};

export const getPurchase = async (
  id: string,
): Promise<PurchaseDetails> => {
  const response = await api.get<PurchaseDetails>(
    `/purchases/${id}`,
  );

  return response.data;
};