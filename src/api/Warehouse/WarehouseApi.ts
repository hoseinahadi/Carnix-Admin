// features/warehouse/api/WarehouseApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import type {
  WarehouseDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseListItemDto,
} from '@/models/warehouse/Warehouse';
import { OperationResult } from '@/models/common/OperationResult';

export const WarehouseApi = {
  // دریافت همه انبارها
  getAll: async () =>
    await axiosInstance.get<OperationResult<WarehouseDto[]>>('/warehouses/get-all'),

  // دریافت انبارهای فعال
  getActive: async () =>
    await axiosInstance.get<OperationResult<WarehouseListItemDto[]>>('/warehouses/get-active'),

  // دریافت یک انبار با شناسه
  getById: async (id: number) =>
    await axiosInstance.get<OperationResult<WarehouseDto>>(`/warehouses/get-by-id/${id}`),

  // دریافت انبارهای یک شهر
  getByCity: async (city: string) =>
    await axiosInstance.get<OperationResult<WarehouseDto[]>>(`/warehouses/get-by-city/${city}`),

  // ایجاد انبار جدید
  create: async (data: CreateWarehouseDto) =>
    await axiosInstance.post<OperationResult<WarehouseDto>>('/warehouses/create', data),

  // ویرایش انبار
  update: async (id: number, data: UpdateWarehouseDto) =>
    await axiosInstance.put<OperationResult<WarehouseDto>>(`/warehouses/update/${id}`, data),

  // حذف انبار
  delete: async (id: number) =>
    await axiosInstance.delete<OperationResult<boolean>>(`/warehouses/delete/${id}`),
};
