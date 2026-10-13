// features/products/api/ProductPriceHistoryApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import type { ProductPriceHistoryDto } from '@/models/product/ProductPricing';

export const ProductPriceHistoryApi = {
  getByProductId: async (productId: number | string) =>
    await axiosInstance.get<ProductPriceHistoryDto[]>(`/ProductPriceHistory/GetByProductId/${productId}`),

  getBySkuId: async (skuId: number | string) =>
    await axiosInstance.get<ProductPriceHistoryDto[]>(`/ProductPriceHistory/GetBySkuId/${skuId}`),
};
