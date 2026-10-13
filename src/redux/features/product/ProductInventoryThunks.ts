// features/products/store/inventory/ProductInventoryThunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductInventoryApi } from '@/api/product/ProductInventoryApi';
import type { UpdateInventoryDto, TransferInventoryDto } from '@/models/product/ProductInventory';

export const getInventoryByProductId = createAsyncThunk(
  'productInventory/getByProductId',
  async (productId: number | string, { rejectWithValue }) => {
    try {
      const response = await ProductInventoryApi.getByProductId(productId);
      if (response.data.isSuccess) return response.data.data;
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت موجودی انبار');
    }
  }
);

export const getInventoryBySkuId = createAsyncThunk(
  'productInventory/getBySkuId',
  async (skuId: number | string, { rejectWithValue }) => {
    try {
      const response = await ProductInventoryApi.getBySkuId(skuId);
      if (response.data.isSuccess) return response.data.data;
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت موجودی انبار');
    }
  }
);

export const updateInventory = createAsyncThunk(
  'productInventory/update',
  async (data: UpdateInventoryDto, { rejectWithValue }) => {
    try {
      const response = await ProductInventoryApi.updateInventory(data);
      if (response.data.isSuccess) return response.data.data;
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در به‌روزرسانی موجودی');
    }
  }
);

export const transferInventory = createAsyncThunk(
  'productInventory/transfer',
  async (data: TransferInventoryDto, { rejectWithValue }) => {
    try {
      const response = await ProductInventoryApi.transferInventory(data);
      if (response.data.isSuccess) return response.data.data;
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در انتقال موجودی');
    }
  }
);

export const getInventoryByWarehouseId = createAsyncThunk(
  'productInventory/getByWarehouseId',
  async (warehouseId: number | string, { rejectWithValue }) => {
    try {
      const response = await ProductInventoryApi.getWithWrehouseId(warehouseId);
      if (response.data.isSuccess) return response.data.data;
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت موجودی انبار');
    }
  }
);

export const adjustInventory = createAsyncThunk(
  'productInventory/adjust',
  async (
    { warehouseId, productId, delta }: { warehouseId: number | string; productId: number | string; delta: number | string },
    { rejectWithValue }
  ) => {
    try {
      const response = await ProductInventoryApi.adjustInventory(warehouseId, productId, delta);
      if (response.data.isSuccess) return response.data.data;
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در تنظیم موجودی');
    }
  }
);

export const getLowStockProducts = createAsyncThunk(
  'productInventory/lowStock',
  async (threshold: number | string, { rejectWithValue }) => {
    try {
      const response = await ProductInventoryApi.lowstock(threshold);
      if (response.data.isSuccess) return response.data.data;
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت محصولات کم موجودی');
    }
  }
);

export const reserveInventory = createAsyncThunk(
  'productInventory/reserve',
  async (
    { productId, quantity }: { productId: number | string; quantity: number | string },
    { rejectWithValue }
  ) => {
    try {
      const response = await ProductInventoryApi.reserve(productId, quantity);
      if (response.data.isSuccess) return response.data.data;
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در رزرو موجودی');
    }
  }
);

export const releaseInventory = createAsyncThunk(
  'productInventory/release',
  async (
    { productId, quantity }: { productId: number | string; quantity: number | string },
    { rejectWithValue }
  ) => {
    try {
      const response = await ProductInventoryApi.release(productId, quantity);
      if (response.data.isSuccess) return response.data.data;
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در آزادسازی موجودی');
    }
  }
);
