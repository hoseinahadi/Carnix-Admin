// features/order/api/AdminOrderApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import { OperationResult } from '@/models/common/OperationResult';

// TODO: این مدل‌ها را در مرحله بعد می‌سازیم و در مسیر زیر قرار می‌دهیم
import type {
  OrderDto,
  PlaceOrderRequestDto,
  ChangeOrderStatusRequestDto,
  CancelOrderAdminRequestDto,
  OrderTrackingResponseDto
} from '@/models/order/Order';

export const orderApi = {
  // ==========================================
  // 0. SPECIAL / ADMIN OPERATIONS
  // ==========================================

  // ثبت نهایی سفارش از طرف مشتری توسط ادمین (تبدیل سبد خرید به سفارش)
  placeOrderAdmin: async (data: PlaceOrderRequestDto) =>
    await axiosInstance.post<OperationResult<number>>('/orders/place-order', data),

  // ==========================================
  // 1. READ OPERATIONS
  // ==========================================

  // دریافت لیست تمام سفارشات
  getAll: async () =>
    await axiosInstance.get<OperationResult<OrderDto[]>>('/orders/GetAll'),

  // دریافت یک سفارش با شناسه
  getById: async (id: number) =>
    await axiosInstance.get<OperationResult<OrderDto>>(`/orders/Get/${id}`),

  // فیلتر و جستجوی پیشرفته سفارشات (چون آبجکت می‌گیرد از POST استفاده شده)
  filter: async (filterCriteria: any) =>
    await axiosInstance.post<OperationResult<OrderDto[]>>('/orders/filter', filterCriteria),

  // جستجوی سریع کلمه‌ای (Keyword) از طریق Query String
  search: async (keyword: string) =>
    await axiosInstance.get<OperationResult<OrderDto[]>>('/orders/search', {
      params: { keyword }
    }),

  // ==========================================
  // 2. CREATE OPERATIONS
  // ==========================================

  // ایجاد یک سفارش جدید به صورت دستی
  create: async (data: OrderDto) =>
     await axiosInstance.post<OperationResult<boolean>>('/orders/Create', data),

  // ایجاد گروهی سفارشات (Bulk Insert)
  createBulk: async (data: OrderDto[]) =>
    await axiosInstance.post<OperationResult<boolean>>('/orders/bulk', data),

  // ==========================================
  // 3. UPDATE OPERATIONS
  // ==========================================

  // ویرایش کامل یک سفارش بر اساس شناسه
  update: async (id: number, data: OrderDto) =>
    await axiosInstance.put<OperationResult<boolean>>(`/orders/Update/${id}`, data),

  // ویرایش گروهی سفارشات (Bulk Update)
  updateBulk: async (data: OrderDto[]) =>
    await axiosInstance.put<OperationResult<boolean>>('/orders/bulkUpdate', data),

  // ==========================================
  // 4. DELETE OPERATIONS
  // ==========================================

  // حذف یک سفارش (توجه: روت در بک‌اند 'Delet' نوشته شده است)
  delete: async (id: number) =>
    await axiosInstance.delete<OperationResult<boolean>>(`/orders/Delet/${id}`),

  // حذف گروهی سفارشات (درخواست Delete با بادی در Axios نیاز به پراپرتی data دارد)
  deleteBulk: async (ids: number[]) =>
    await axiosInstance.delete<OperationResult<boolean>>('/orders/DeleteBulk', {
      data: ids 
    }),

  // ==========================================
  // 5. BUSINESS OPERATIONS
  // ==========================================

  // تغییر وضعیت سفارش (مثلاً از Pending به Shipped)
  changeStatus: async (id: number, data: ChangeOrderStatusRequestDto) =>
    await axiosInstance.patch<OperationResult<boolean>>(`/orders/${id}/status`, data),

  // لغو سفارش توسط ادمین و ثبت دلیل
  cancelOrder: async (id: number, data: CancelOrderAdminRequestDto) =>
    await axiosInstance.post<OperationResult<boolean>>(`/orders/${id}/cancel`, data),

  // دریافت تاریخچه و وضعیت رهگیری لجستیک سفارش
  getTracking: async (id: number) =>
    await axiosInstance.get<OperationResult<OrderTrackingResponseDto>>(`/orders/${id}/tracking`),
};
