// src/api/services/CategoryApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import { Category} from '@/models/category/Category';
import {  CreateCategoryDto } from '@/models/category/CreateCategoryDto';
import {  UpdateCategoryDto } from '@/models/category/UpdateCategoryDto';

const BASE_URL = '/Category';

export const CategoryApi = {
  // دریافت لیست تمام دسته‌بندی‌ها
  getAll: async () => {
    return await axiosInstance.get<Category[]>(BASE_URL);
  },

  // دریافت یک دسته‌بندی بر اساس شناسه
  getById: async (id: number) => {
    return await axiosInstance.get<Category>(`${BASE_URL}/${id}`);
  },

  // جستجو در دسته‌بندی‌ها
  search: async (keyword: string) => {
    return await axiosInstance.get<Category[]>(`${BASE_URL}/search`, {
      params: { keyword }
    });
  },

  // ایجاد دسته‌بندی جدید
  create: async (payload: CreateCategoryDto) => {
    return await axiosInstance.post<Category>(BASE_URL, payload);
  },

  // ویرایش دسته‌بندی موجود
  update: async (id: number, payload: UpdateCategoryDto) => {
    return await axiosInstance.put<Category>(`${BASE_URL}/${id}`, payload);
  },

  // حذف یک دسته‌بندی
  delete: async (id: number) => {
    return await axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  // ایجاد گروهی دسته‌بندی‌ها
  bulkCreate: async (payload: CreateCategoryDto[]) => {
    return await axiosInstance.post<Category[]>(`${BASE_URL}/bulk`, payload);
  },

  // حذف گروهی دسته‌بندی‌ها (ارسال آرایه‌ای از IDها در Body)
  bulkDelete: async (ids: number[]) => {
    return await axiosInstance.delete(`${BASE_URL}/bulk`, { data: ids });
  }
};
