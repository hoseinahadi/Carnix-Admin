// features/products/api/ProductBundleApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import type { ProductBundleDto, ProductBundleItemDto } from '@/models/product/ProductMarketing';

export const ProductBundleApi = {
  // Bundle Operations
  getAll: async () =>
    await axiosInstance.get<ProductBundleDto[]>('/ProductBundle/GetAll'),

  getById: async (id: number | string) =>
    await axiosInstance.get<ProductBundleDto>(`/ProductBundle/GetById/${id}`),

  create: async (data: Omit<ProductBundleDto, 'productBundleId'>) =>
    await axiosInstance.post<ProductBundleDto>('/ProductBundle/Create', data),

  update: async (data: ProductBundleDto) =>
    await axiosInstance.put<ProductBundleDto>(`/ProductBundle/Update/${data.productBundleId}`, data),

  delete: async (id: number | string) =>
    await axiosInstance.delete(`/ProductBundle/Delete/${id}`),

  // Bundle Items Operations
  getItemsByBundleId: async (bundleId: number | string) =>
    await axiosInstance.get<ProductBundleItemDto[]>(`/ProductBundleItem/GetByBundleId/${bundleId}`),

  addItem: async (data: Omit<ProductBundleItemDto, 'productBundleItemId'>) =>
    await axiosInstance.post<ProductBundleItemDto>('/ProductBundleItem/Create', data),

  removeItem: async (itemId: number | string) =>
    await axiosInstance.delete(`/ProductBundleItem/Delete/${itemId}`),
};
