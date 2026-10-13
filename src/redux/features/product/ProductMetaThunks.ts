import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductSeoApi } from '@/api/product/ProductSeoApi';
import { ProductTagApi } from '@/api/product/ProductTagApi';
import { ProductSimilarityApi } from '@/api/product/ProductSimilarityApi';
import type { ProductSEODto, TagDto, ProductTagDto, ProductSimilarityDto } from '@/models/product/ProductSeoAndTags';

// ─── SEO ────────────────────────────────────────────────────────────────
export const fetchProductSeo = createAsyncThunk('productMeta/fetchSeo', async (productId: number | string, { rejectWithValue }) => {
  try {
    const response = await ProductSeoApi.getByProductId(productId);
    return response.data?.data ?? response.data;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در دریافت سئو'); }
});

export const saveProductSeo = createAsyncThunk('productMeta/saveSeo', async (data: ProductSEODto, { rejectWithValue }) => {
  try {
    const response = await ProductSeoApi.createOrUpdate(data);
    return response.data?.data ?? response.data;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در ذخیره سئو'); }
});

// ─── Tags (Global & Product-Specific) ───────────────────────────────────
export const fetchAllTags = createAsyncThunk('productMeta/fetchAllTags', async (_, { rejectWithValue }) => {
  try {
    const response = await ProductTagApi.getAllTags();
    return response.data?.data ?? response.data;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در دریافت تگ‌ها'); }
});

export const fetchProductTags = createAsyncThunk('productMeta/fetchProductTags', async (productId: number | string, { rejectWithValue }) => {
  try {
    const response = await ProductTagApi.getTagsByProductId(productId);
    return response.data?.data ?? response.data;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در دریافت تگ‌های محصول'); }
});

export const assignTagToProduct = createAsyncThunk('productMeta/assignTag', async (data: Omit<ProductTagDto, 'productTagId'>, { rejectWithValue }) => {
  try {
    const response = await ProductTagApi.assignTagToProduct(data);
    return response.data?.data ?? response.data;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در اتصال تگ به محصول'); }
});

export const removeTagFromProduct = createAsyncThunk('productMeta/removeTag', async (id: number | string, { rejectWithValue }) => {
  try {
    await ProductTagApi.removeTagFromProduct(id);
    return id;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در حذف تگ محصول'); }
});

// ─── Similarities ───────────────────────────────────────────────────────
export const fetchSimilarProducts = createAsyncThunk('productMeta/fetchSimilarities', async (productId: number | string, { rejectWithValue }) => {
  try {
    const response = await ProductSimilarityApi.getByProductId(productId);
    return response.data?.data ?? response.data;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در دریافت محصولات مشابه'); }
});

export const addSimilarProduct = createAsyncThunk('productMeta/addSimilarity', async (data: Omit<ProductSimilarityDto, 'productSimilarityId'>, { rejectWithValue }) => {
  try {
    const response = await ProductSimilarityApi.addSimilarity(data);
    return response.data?.data ?? response.data;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در افزودن محصول مشابه'); }
});

export const removeSimilarProduct = createAsyncThunk('productMeta/removeSimilarity', async (id: number | string, { rejectWithValue }) => {
  try {
    await ProductSimilarityApi.removeSimilarity(id);
    return id;
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در حذف محصول مشابه'); }
});
