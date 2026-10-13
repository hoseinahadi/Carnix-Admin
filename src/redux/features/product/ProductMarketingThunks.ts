import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductDiscountApi } from '@/api/product/ProductDiscountApi';
import { ProductWarrantyApi } from '@/api/product/ProductWarrantyApi';
import type { ProductDiscountDto, ProductWarrantyDto } from '@/models/product/ProductMarketing';

// ─── Discounts ──────────────────────────────────────────────────────────
export const fetchDiscounts = createAsyncThunk('productMarketing/fetchDiscounts', async (productId: number | undefined, { rejectWithValue }) => {
  try {
    const response = await ProductDiscountApi.getAll(productId);
    return response.data?.data ?? response.data;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در دریافت تخفیف‌ها'); }
});

export const createDiscount = createAsyncThunk('productMarketing/createDiscount', async (data: Omit<ProductDiscountDto, 'productDiscountId' | 'currentUsageCount'>, { rejectWithValue }) => {
  try {
    const response = await ProductDiscountApi.create(data);
    return response.data?.data ?? response.data;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در ایجاد تخفیف'); }
});

export const updateDiscount = createAsyncThunk('productMarketing/updateDiscount', async (data: ProductDiscountDto, { rejectWithValue }) => {
  try {
    const response = await ProductDiscountApi.update(data);
    return response.data?.data ?? response.data;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در ویرایش تخفیف'); }
});

export const deleteDiscount = createAsyncThunk('productMarketing/deleteDiscount', async (id: number | string, { rejectWithValue }) => {
  try {
    await ProductDiscountApi.delete(id);
    return id;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در حذف تخفیف'); }
});

// ─── Warranties ─────────────────────────────────────────────────────────
export const fetchWarranties = createAsyncThunk('productMarketing/fetchWarranties', async (productId: number | undefined, { rejectWithValue }) => {
  try {
    const response = await ProductWarrantyApi.getAll(productId);
    return response.data?.data ?? response.data;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در دریافت گارانتی‌ها'); }
});

export const createWarranty = createAsyncThunk('productMarketing/createWarranty', async (data: Omit<ProductWarrantyDto, 'productWarrantyId'>, { rejectWithValue }) => {
  try {
    const response = await ProductWarrantyApi.create(data);
    return response.data?.data ?? response.data;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در ایجاد گارانتی'); }
});

export const updateWarranty = createAsyncThunk('productMarketing/updateWarranty', async (data: ProductWarrantyDto, { rejectWithValue }) => {
  try {
    const response = await ProductWarrantyApi.update(data);
    return response.data?.data ?? response.data;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در ویرایش گارانتی'); }
});

export const deleteWarranty = createAsyncThunk('productMarketing/deleteWarranty', async (id: number | string, { rejectWithValue }) => {
  try {
    await ProductWarrantyApi.delete(id);
    return id;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در حذف گارانتی'); }
});
