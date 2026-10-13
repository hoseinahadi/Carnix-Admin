// features/brand/BrandApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import type { Brand } from '@/models/Brand/Brand';
import { OperationResult } from '@/models/common/OperationResult';

export const BrandApi = {
  // دریافت همه برندها
  getAll: async () =>
    await axiosInstance.get<OperationResult<Brand[]>>('/brands/get-all'),

  // دریافت یک برند با شناسه
  getById: async (id: number) =>
    await axiosInstance.get<OperationResult<Brand>>(`/brands/get-by-id/${id}`),

  // ایجاد برند جدید
  create: async (data: Brand) =>
    await axiosInstance.post<OperationResult<Brand>>('/brands/create', data),

  // ویرایش برند
  update: async (id: number, data: Brand) =>
    await axiosInstance.put<OperationResult<Brand>>(`/brands/update/${id}`, data),

  // حذف برند
  delete: async (id: number) =>
    await axiosInstance.delete<OperationResult<boolean>>(`/brands/delete/${id}`),
};
