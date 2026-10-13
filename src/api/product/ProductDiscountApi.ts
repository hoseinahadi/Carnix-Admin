// features/products/api/ProductDiscountApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import type { ProductDiscountDto } from '@/models/product/ProductMarketing';

export const ProductDiscountApi = {
  getAll: async (productId?: number) =>
    await axiosInstance.get<ProductDiscountDto[]>('/ProductDiscounts/GetAll', { params: { productId } }),

  getById: async (id: number | string) =>
    await axiosInstance.get<ProductDiscountDto>(`/ProductDiscounts/GetById/${id}`),

  create: async (data: Omit<ProductDiscountDto, 'productDiscountId' | 'currentUsageCount'>) =>
    await axiosInstance.post<ProductDiscountDto>('/ProductDiscounts/Create', data),

  update: async (data: ProductDiscountDto) =>
    await axiosInstance.put<ProductDiscountDto>(`/ProductDiscounts/Update/${data.productDiscountId}`, data),

  delete: async (id: number | string) =>
    await axiosInstance.delete(`/ProductDiscounts/Delete/${id}`),
};
