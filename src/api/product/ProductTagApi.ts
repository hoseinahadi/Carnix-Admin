// features/products/api/ProductTagApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import type { TagDto, ProductTagDto } from '@/models/product/ProductSeoAndTags';

export const ProductTagApi = {
  // Global Tags Operations
  getAllTags: async () =>
    await axiosInstance.get<TagDto[]>('/tags/get-all'),

  createTag: async (data: Omit<TagDto, 'tagId'>) =>
    await axiosInstance.post<TagDto>('/tags/Create', data),

  updateTag: async (data: TagDto) =>
    await axiosInstance.put<TagDto>(`/tags/Update/${data.tagId}`, data),

  deleteTag: async (id: number | string) =>
    await axiosInstance.delete(`/tags/Delete/${id}`),

  // Product-Specific Tags Operations
  getTagsByProductId: async (productId: number | string) =>
    await axiosInstance.get<ProductTagDto[]>(`/product-tags/get-by-product/${productId}`),

  assignTagToProduct: async (data: Omit<ProductTagDto, 'productTagId'>) =>
    await axiosInstance.post<ProductTagDto>('/product-tags/Create', data),

  removeTagFromProduct: async (id: number | string) =>
    await axiosInstance.delete(`/product-tags/Delete/${id}`),
};
