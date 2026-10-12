import api from '@/lib/api';

export type InitSslcommerzPaymentPayload = {
  saleId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
};

export type InitSslcommerzPaymentResponse = {
  success: boolean;
  saleId: string;
  transactionId: string;
  amount: number;
  gatewayPageURL: string;
  sessionKey: string;
};

export const initSslcommerzPayment = async (
  payload: InitSslcommerzPaymentPayload,
): Promise<InitSslcommerzPaymentResponse> => {
  const response =
    await api.post<InitSslcommerzPaymentResponse>(
      '/payments/sslcommerz/init',
      payload,
    );

  return response.data;
};