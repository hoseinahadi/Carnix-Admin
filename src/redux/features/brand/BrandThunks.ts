// features/brand/store/BrandThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BrandApi } from '@/api/brand/routes';
import type { Brand } from '@/models/Brand/Brand';

export const getAllBrands = createAsyncThunk(
  'brand/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await BrandApi.getAll();
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت برندها');
    }
  }
);

export const getBrandById = createAsyncThunk(
  'brand/getById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await BrandApi.getById(id);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت برند');
    }
  }
);

export const createBrand = createAsyncThunk(
  'brand/create',
  async (data: Brand, { rejectWithValue }) => {
    try {
      const response = await BrandApi.create(data);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ایجاد برند');
    }
  }
);

export const updateBrand = createAsyncThunk(
  'brand/update',
  async ({ id, data }: { id: number; data: Brand }, { rejectWithValue }) => {
    try {
      const response = await BrandApi.update(id, data);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ویرایش برند');
    }
  }
);

export const deleteBrand = createAsyncThunk(
  'brand/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await BrandApi.delete(id);
      if (response.data.isSuccess) {
        return id;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در حذف برند');
    }
  }
);
