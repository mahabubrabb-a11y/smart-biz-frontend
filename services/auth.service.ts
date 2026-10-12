import api from '@/lib/api';

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;

  user: {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'manager' | 'staff';
    shopId: string;
  };
};

export const login = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    '/auth/login',
    payload,
  );

  return response.data;
};