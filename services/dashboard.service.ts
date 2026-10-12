import api from '@/lib/api';

export type DashboardData = {
  sales: {
    total: number;
    paid: number;
    customerDue: number;
    today: number;
  };

  purchases: {
    total: number;
    paid: number;
    supplierDue: number;
  };

  profit: {
    revenue: number;
    cost: number;
    grossProfit: number;
  };

  inventory: {
    totalProducts: number;
    totalStock: number;
    lowStockProducts: number;
  };
};

export const getDashboard = async (): Promise<DashboardData> => {
  const response = await api.get<DashboardData>(
    '/dashboard/summary',
  );

  return response.data;
};