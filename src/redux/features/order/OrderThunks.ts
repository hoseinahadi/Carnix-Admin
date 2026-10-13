// features/adminOrder/store/AdminOrderThunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { orderApi } from '@/api/order/OrderApi';
import type { 
  OrderDto, 
  ChangeOrderStatusRequestDto, 
  CancelOrderAdminRequestDto, 
  PlaceOrderRequestDto 
} from '@/models/order/Order';

export const getAllOrders = createAsyncThunk(
  'adminOrder/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderApi.getAll();
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت سفارشات');
    }
  }
);

export const getOrderById = createAsyncThunk(
  'adminOrder/getById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await orderApi.getById(id);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت جزئیات سفارش');
    }
  }
);

export const createOrder = createAsyncThunk(
  'adminOrder/create',
  async (data: OrderDto, { rejectWithValue }) => {
    try {
      const response = await orderApi.create(data);
      if (response.data.isSuccess) {
        // چون API ما فقط boolean برمی‌گرداند، خود دیتا را برای اضافه کردن به استیت ریترن می‌کنیم
        return data; 
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ایجاد سفارش');
    }
  }
);

export const updateOrder = createAsyncThunk(
  'adminOrder/update',
  async ({ id, data }: { id: number; data: OrderDto }, { rejectWithValue }) => {
    try {
      const response = await orderApi.update(id, data);
      if (response.data.isSuccess) {
        return data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ویرایش سفارش');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'adminOrder/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await orderApi.delete(id);
      if (response.data.isSuccess) {
        return id;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در حذف سفارش');
    }
  }
);

// --- عملیات بیزینسی ---

export const changeOrderStatus = createAsyncThunk(
  'adminOrder/changeStatus',
  async ({ id, data }: { id: number; data: ChangeOrderStatusRequestDto }, { rejectWithValue }) => {
    try {
      const response = await orderApi.changeStatus(id, data);
      if (response.data.isSuccess) {
        return { id, newStatus: data.StatusId };
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در تغییر وضعیت سفارش');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'adminOrder/cancelOrder',
  async ({ id, data }: { id: number; data: CancelOrderAdminRequestDto }, { rejectWithValue }) => {
    try {
      const response = await orderApi.cancelOrder(id, data);
      if (response.data.isSuccess) {
        return id;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در لغو سفارش');
    }
  }
);

export const placeOrderAdmin = createAsyncThunk(
  'adminOrder/placeOrderAdmin',
  async (data: PlaceOrderRequestDto, { rejectWithValue }) => {
    try {
      const response = await orderApi.placeOrderAdmin(data);
      if (response.data.isSuccess) {
        return response.data.data; // برگرداندن شناسه سفارش ثبت شده
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ثبت سفارش توسط ادمین');
    }
  }
);
