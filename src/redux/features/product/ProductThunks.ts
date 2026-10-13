// features/products/store/ProductThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductApi } from '@/api/product/ProductApi';
import type {
  CreateProductDto,
  UpdateProductDto,
  ProductFilters
} from '@/models/product/Product';

export const getAllProducts = createAsyncThunk(
  'product/getAll',
  async (filters: ProductFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await ProductApi.getAll(filters);
      // چون بک‌ایند OperationResult برمی‌گرداند، دیتا در response.data.data است
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت محصولات');
    }
  }
);

export const getProductDetails = createAsyncThunk(
  'product/getDetails',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await ProductApi.getDetails(id);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت جزئیات محصول');
    }
  }
);

export const createProduct = createAsyncThunk(
  'product/create',
  async (data: CreateProductDto, { rejectWithValue }) => {
    try {
      const response = await ProductApi.create(data);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ایجاد محصول');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'product/update',
  async (data: UpdateProductDto, { rejectWithValue }) => {
    try {
      const response = await ProductApi.update(data);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ویرایش محصول');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'product/delete',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await ProductApi.delete(id);
      if (response.data.isSuccess) {
        return id;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در حذف محصول');
    }
  }
);

export const toggleProductStatus = createAsyncThunk(
  'product/toggleStatus',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await ProductApi.toggleStatus(id);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در تغییر وضعیت');
    }
  }
);
