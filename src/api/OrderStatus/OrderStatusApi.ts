// features/orderStatus/api/AdminOrderStatusApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import { OperationResult } from '@/models/common/OperationResult';

// ==========================================
// 1. MODELS / INTERFACES
// ==========================================

// مدل مطابق با موجودیت OrderStatus در بک‌اند
export interface OrderStatusDto {
  orderStatusId: number;
  code: string;
  title: string;
  description: string;
  isFinal: boolean;
  displayOrder: number;
  createdAt?: string; // فرمت تاریخ ISO
  lastUpdatedAt?: string; // فرمت تاریخ ISO
}

// ==========================================
// 2. API CLIENT
// ==========================================

export const orderStatusApi = {
  // ==========================================
  // READ OPERATIONS
  // ==========================================

  // دریافت لیست تمام وضعیت‌های سفارش
  getAll: async () =>
    await axiosInstance.get<OperationResult<OrderStatusDto[]>>('/OrderStatus'),

  // دریافت یک وضعیت سفارش با شناسه
  getById: async (id: number) =>
    await axiosInstance.get<OperationResult<OrderStatusDto>>(`/OrderStatus/${id}`),

  // ==========================================
  // CREATE OPERATIONS
  // ==========================================

  // ایجاد یک وضعیت سفارش جدید
  create: async (data: Omit<OrderStatusDto, 'orderStatusId' | 'createdAt' | 'lastUpdatedAt'>) =>
    await axiosInstance.post<OperationResult<boolean>>('/OrderStatus', data),

  // ==========================================
  // UPDATE OPERATIONS
  // ==========================================

  // ویرایش وضعیت سفارش موجود
  update: async (id: number, data: OrderStatusDto) =>
    await axiosInstance.put<OperationResult<boolean>>(`/OrderStatus/${id}`, data),

  // ==========================================
  // DELETE OPERATIONS
  // ==========================================

  // حذف وضعیت سفارش
  delete: async (id: number) =>
    await axiosInstance.delete<OperationResult<boolean>>(`/OrderStatus/${id}`),
};
