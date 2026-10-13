// features/products/store/sku/ProductSkuThunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductSkuApi } from '@/api/product/ProductSkuApi';
import type { ProductSkuDto } from '@/models/product/ProductSku';

export const getSkusByProductId = createAsyncThunk(
  'productSku/getByProductId',
  async (productId: number | string, { rejectWithValue }) => {
    try {
      const response = await ProductSkuApi.getByProductId(productId);
      if (response.data.isSuccess) return response.data.data;
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت تنوع‌ها');
    }
  }
);

export const createSku = createAsyncThunk(
  'productSku/create',
  async (data: Omit<ProductSkuDto, 'skuId'>, { rejectWithValue }) => {
    try {
      const response = await ProductSkuApi.create(data);
      if (response.data.isSuccess) return response.data.data;
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ایجاد تنوع');
    }
  }
);

export const updateSku = createAsyncThunk(
  'productSku/update',
  async (data: ProductSkuDto, { rejectWithValue }) => {
    try {
      const response = await ProductSkuApi.update(data);
      if (response.data.isSuccess) return response.data.data;
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ویرایش تنوع');
    }
  }
);

export const deleteSku = createAsyncThunk(
  'productSku/delete',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await ProductSkuApi.delete(id);
      if (response.data.isSuccess) return id;
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در حذف تنوع');
    }
  }
);
