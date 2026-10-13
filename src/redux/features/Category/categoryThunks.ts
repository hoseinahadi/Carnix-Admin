// src/redux/Category/categoryThunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { CategoryApi } from '@/api/category/routes';
import { CreateCategoryDto } from '@/models/category/CreateCategoryDto';
import {  UpdateCategoryDto } from '@/models/category/UpdateCategoryDto';

export const fetchCategories = createAsyncThunk(
  'category/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.getAll();
      console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
      console.log(response.data)
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'خطا در دریافت لیست دسته‌بندی‌ها');
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'category/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'خطا در دریافت دسته‌بندی');
    }
  }
);

export const searchCategories = createAsyncThunk(
  'category/search',
  async (keyword: string, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.search(keyword);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'خطا در جستجوی دسته‌بندی‌ها');
    }
  }
);

export const createCategory = createAsyncThunk(
  'category/create',
  async (payload: CreateCategoryDto, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.create(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'خطا در ایجاد دسته‌بندی');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'category/update',
  async ({ categoryId, payload }: { categoryId: number; payload: UpdateCategoryDto }, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.update(categoryId, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'خطا در ویرایش دسته‌بندی');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'category/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await CategoryApi.delete(id);
      return id; // برگرداندن شناسه برای حذف از استیت
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'خطا در حذف دسته‌بندی');
    }
  }
);
