// features/products/api/ProductSkuApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import type { ProductSkuDto } from '@/models/product/ProductSku';
import type { ProductSKUAttributeDto } from '@/models/product/ProductSKUAttributeDto';

export const ProductSkuApi = {
  getAll: async (productId?: number) => 
    await axiosInstance.get<ProductSkuDto[]>('/ProductSku/GetAll', { params: { productId } }),

  getById: async (id: number | string) =>
    await axiosInstance.get<ProductSkuDto>(`/ProductSku/GetById/${id}`),

  create: async (data: Omit<ProductSkuDto, 'id'>) =>
    await axiosInstance.post<ProductSkuDto>('/ProductSku/Create', data),

  update: async (data: ProductSkuDto) =>
    await axiosInstance.put<ProductSkuDto>(`/ProductSku/Update/${data.productSkuid}`, data),

  delete: async (id: number | string) =>
    await axiosInstance.delete(`/ProductSku/Delete/${id}`),

  // API های مربوط به ویژگی‌های (Attributes) یک Sku خاص
  getAttributesBySkuId: async (skuId: number | string) =>
    await axiosInstance.get<ProductSKUAttributeDto[]>(`/ProductSKUAttributes/GetBySkuId/${skuId}`),
};
