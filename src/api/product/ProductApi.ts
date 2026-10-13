// features/products/api/ProductApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
} from '@/models/product/Product';
import { ProductDetails, OperationResult } from '@/models/product/ProductDetails';

export const ProductApi = {
  // دریافت همه محصولات برای جدول اصلی
  getAll: async (filters?: ProductFilters) =>
    await axiosInstance.get<OperationResult<Product[]>>('/Product/GetAll', {
      params: filters
    }),

  // دریافت جزئیات کامل برای مدال (شامل SKU و عکس‌ها)
  getDetails: async (id: number | string) =>
    await axiosInstance.get<OperationResult<ProductDetails>>(`/Product/${id}/details`),

  // دریافت یک محصول ساده
  getById: async (id: number | string) =>
    await axiosInstance.get<OperationResult<Product>>(`/Product/${id}`),

  // جستجو
  search: async (keyword: string) =>
    await axiosInstance.get<OperationResult<Product[]>>('/Product/search', {
      params: { keyword }
    }),

  // ایجاد محصول
  create: async (data: CreateProductDto) =>
    await axiosInstance.post<OperationResult<Product>>('/Product/Create', data),

  // ویرایش محصول
  update: async (data: UpdateProductDto) =>
    await axiosInstance.put<OperationResult<Product>>(`/Product/${data.productId}`, data),

  // حذف محصول
  delete: async (id: number | string) =>
    await axiosInstance.delete<OperationResult<boolean>>(`/Product/${id}`),

  // تغییر وضعیت فعال/غیرفعال
  toggleStatus: async (id: number | string) =>
    await axiosInstance.patch<OperationResult<Product>>(`/Product/${id}/toggle-active`),
};
