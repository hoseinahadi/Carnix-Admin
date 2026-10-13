// features/orderStatus/store/OrderStatusThunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { orderStatusApi } from '@/api/OrderStatus/OrderStatusApi'; // ایمپورت سرویس API که در مرحله قبل ساختیم
import type { OrderStatusDto } from '@/api/OrderStatus/OrderStatusApi';

export const getAllOrderStatuses = createAsyncThunk(
  'orderStatus/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderStatusApi.getAll();
      // اگر در کنترلر دیتای مستقیم می‌آید:
      // return response.data;
      
      // مطابق با الگوی Brand شما:
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت وضعیت‌های سفارش');
    }
  }
);

export const getOrderStatusById = createAsyncThunk(
  'orderStatus/getById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await orderStatusApi.getById(id);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت وضعیت سفارش');
    }
  }
);

export const createOrderStatus = createAsyncThunk(
  'orderStatus/create',
  async (data: Omit<OrderStatusDto, 'orderStatusId' | 'createdAt' | 'lastUpdatedAt'>, { rejectWithValue }) => {
    try {
      const response = await orderStatusApi.create(data);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ایجاد وضعیت سفارش');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orderStatus/update',
  async ({ id, data }: { id: number; data: OrderStatusDto }, { rejectWithValue }) => {
    try {
      const response = await orderStatusApi.update(id, data);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ویرایش وضعیت سفارش');
    }
  }
);

export const deleteOrderStatus = createAsyncThunk(
  'orderStatus/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await orderStatusApi.delete(id);
      if (response.data.isSuccess) {
        return id; // برگشت دادن ID برای استفاده احتمالی در Slice
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در حذف وضعیت سفارش');
    }
  }
);
