// features/warehouse/store/WarehouseThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { WarehouseApi } from '@/api/Warehouse/WarehouseApi';
import type { CreateWarehouseDto, UpdateWarehouseDto } from '@/models/warehouse/Warehouse';

export const getAllWarehouses = createAsyncThunk(
  'warehouse/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await WarehouseApi.getAll();
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت انبارها');
    }
  }
);

export const getActiveWarehouses = createAsyncThunk(
  'warehouse/getActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await WarehouseApi.getActive();
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت انبارهای فعال');
    }
  }
);

export const getWarehouseById = createAsyncThunk(
  'warehouse/getById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await WarehouseApi.getById(id);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت انبار');
    }
  }
);

export const createWarehouse = createAsyncThunk(
  'warehouse/create',
  async (data: CreateWarehouseDto, { rejectWithValue }) => {
    try {
      const response = await WarehouseApi.create(data);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ایجاد انبار');
    }
  }
);

export const updateWarehouse = createAsyncThunk(
  'warehouse/update',
  async ({ id, data }: { id: number; data: UpdateWarehouseDto }, { rejectWithValue }) => {
    try {
      const response = await WarehouseApi.update(id, data);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ویرایش انبار');
    }
  }
);

export const deleteWarehouse = createAsyncThunk(
  'warehouse/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await WarehouseApi.delete(id);
      if (response.data.isSuccess) {
        return id;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در حذف انبار');
    }
  }
);
