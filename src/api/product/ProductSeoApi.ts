// features/products/api/ProductSeoApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import type { ProductSEODto } from '@/models/product/ProductSeoAndTags';

export const ProductSeoApi = {
  getByProductId: async (productId: number | string) =>
    await axiosInstance.get<ProductSEODto>(`/product-seo/get-by-product/${productId}`),

  createOrUpdate: async (data: ProductSEODto) =>
    await axiosInstance.post<ProductSEODto>('/product-seo/Create', data), // فرض بر این است که متدی برای ایجاد یا آپدیت یکجا دارید
};
