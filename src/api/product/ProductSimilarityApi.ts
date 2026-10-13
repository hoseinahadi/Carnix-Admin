// features/products/api/ProductSimilarityApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import type { ProductSimilarityDto } from '@/models/product/ProductSeoAndTags';

export const ProductSimilarityApi = {
  getByProductId: async (productId: number | string) =>
    await axiosInstance.get<ProductSimilarityDto[]>(`/ProductSimilarity/GetSimilarProducts/${productId}`),

  addSimilarity: async (data: Omit<ProductSimilarityDto, 'productSimilarityId'>) =>
    await axiosInstance.post<ProductSimilarityDto>('/ProductSimilarity/Create', data),

  removeSimilarity: async (id: number | string) =>
    await axiosInstance.delete(`/ProductSimilarity/Delete/${id}`),
};
