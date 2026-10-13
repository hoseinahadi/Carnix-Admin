// features/products/store/media/ProductMediaThunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductMediaApi } from '@/api/product/ProductMediaApi';
import type { AddProductMediaDto } from '@/models/product/ProductMedia';

// --- Images ---
export const getProductImages = createAsyncThunk('productMedia/getImages', async (productId: number | string, { rejectWithValue }) => {
  try {
    const response = await ProductMediaApi.getImagesByProductId(productId);
    if (response.data.isSuccess) return response.data.data;
    return rejectWithValue(response.data.message);
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در دریافت تصاویر'); }
});

export const addProductImage = createAsyncThunk('productMedia/addImage', async (data: AddProductMediaDto, { rejectWithValue }) => {
  try {
    const response = await ProductMediaApi.addImage(data);
    if (response.data.isSuccess) return response.data.data;
    return rejectWithValue(response.data.message);
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در افزودن تصویر'); }
});

export const deleteProductImage = createAsyncThunk('productMedia/deleteImage', async (id: number | string, { rejectWithValue }) => {
  try {
    const response = await ProductMediaApi.deleteImage(id);
    if (response.data.isSuccess) return id;
    return rejectWithValue(response.data.message);
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در حذف تصویر'); }
});

// --- Videos ---
export const getProductVideos = createAsyncThunk('productMedia/getVideos', async (productId: number | string, { rejectWithValue }) => {
  try {
    const response = await ProductMediaApi.getVideosByProductId(productId);
    if (response.data.isSuccess) return response.data.data;
    return rejectWithValue(response.data.message);
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در دریافت ویدیوها'); }
});

export const addProductVideo = createAsyncThunk('productMedia/addVideo', async (data: AddProductMediaDto, { rejectWithValue }) => {
  try {
    const response = await ProductMediaApi.addVideo(data);
    if (response.data.isSuccess) return response.data.data;
    return rejectWithValue(response.data.message);
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در افزودن ویدیو'); }
});

export const deleteProductVideo = createAsyncThunk('productMedia/deleteVideo', async (id: number | string, { rejectWithValue }) => {
  try {
    const response = await ProductMediaApi.deleteVideo(id);
    if (response.data.isSuccess) return id;
    return rejectWithValue(response.data.message);
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در حذف ویدیو'); }
});

// --- 360 Views ---
export const getProduct360Views = createAsyncThunk('productMedia/get360Views', async (productId: number | string, { rejectWithValue }) => {
  try {
    const response = await ProductMediaApi.get360ViewsByProductId(productId);
    if (response.data.isSuccess) return response.data.data;
    return rejectWithValue(response.data.message);
  } catch (error: any) { return rejectWithValue(error.response?.data?.message || 'خطا در دریافت نمای 360'); }
});
