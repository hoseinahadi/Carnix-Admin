// features/products/api/ProductWarrantyApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import type { ProductWarrantyDto } from '@/models/product/ProductMarketing';

export const ProductWarrantyApi = {
  getAll: async (productId?: number) =>
    await axiosInstance.get<ProductWarrantyDto[]>('/ProductWarranty/GetAll', { params: { productId } }),

  getById: async (id: number | string) =>
    await axiosInstance.get<ProductWarrantyDto>(`/ProductWarranty/GetById/${id}`),

  create: async (data: Omit<ProductWarrantyDto, 'productWarrantyId'>) =>
    await axiosInstance.post<ProductWarrantyDto>('/ProductWarranty/Create', data),

  update: async (data: ProductWarrantyDto) =>
    await axiosInstance.put<ProductWarrantyDto>(`/ProductWarranty/Update/${data.productWarrantyId}`, data),

  delete: async (id: number | string) =>
    await axiosInstance.delete(`/ProductWarranty/Delete/${id}`),
};
