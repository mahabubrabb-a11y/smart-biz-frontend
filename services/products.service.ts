
import api from '@/lib/api';

export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
  isActive: boolean;
  imageUrl: string | null;
};

export type CreateProductPayload = {
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
};

export type UpdateProductPayload = {
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('/products');
  return response.data;
};

export const createProduct = async (
  payload: CreateProductPayload,
): Promise<Product> => {
  const response = await api.post<Product>(
    '/products',
    payload,
  );

  return response.data;
};


 
export async function uploadProductImage(
  id: string,
  image: File,
) {
  const formData = new FormData();
  formData.append('image', image);

  const response = await api.post(
    `/products/${id}/image`,
    formData,
    {
      headers: {
        'Content-Type': undefined,
      },
    },
  );

  return response.data;
}



export const updateProduct = async (
  id: string,
  payload: UpdateProductPayload,
): Promise<Product> => {
  const response = await api.patch<Product>(
    `/products/${id}`,
    payload,
  );

  return response.data;
};

export const deleteProduct = async (
  id: string,
): Promise<void> => {
  await api.delete(`/products/${id}`);
};
