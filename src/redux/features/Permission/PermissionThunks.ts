// src/store/Permission/PermissionThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { PermissionApi } from '@/api/Permission/routes';
import { AssignRoleDto } from '@/models/Permission/AssignRoleDto';
import {  PermissionUpdateDto } from '@/models/Permission/PermissionUpdateDto';

// دریافت ساختار درختی پروژه
export const fetchProjectStructure = createAsyncThunk(
  'permission/fetchProjectStructure',
  async (roleId: number, { rejectWithValue }) => {
    try {
      const response = await PermissionApi.getProjectStructure(roleId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'خطا در دریافت ساختار پروژه');
    }
  }
);


// دریافت دسترسی‌های یک نقش خاص
export const fetchRolePermissions = createAsyncThunk(
  'permission/fetchRolePermissions',
  async (roleId: number, { rejectWithValue }) => {
    try {
        console.log("GGGGGGGGGGGGGG",roleId)
      const response = await PermissionApi.getRolePermissions(roleId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'خطا در دریافت دسترسی‌های نقش');
    }
  }
);

// بروزرسانی دسترسی‌های یک نقش
export const updateRolePermissions = createAsyncThunk(
  'permission/updateRolePermissions',
  async (payload: PermissionUpdateDto, { rejectWithValue }) => {
    try {
      const response = await PermissionApi.updateRolePermissions(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'خطا در بروزرسانی دسترسی‌ها');
    }
  }
);

// تخصیص نقش به کاربر
export const assignRolesToUser = createAsyncThunk(
  'permission/assignRolesToUser',
  async (payload: AssignRoleDto, { rejectWithValue }) => {
    try {
      const response = await PermissionApi.assignRolesToUser(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'خطا در تخصیص نقش به کاربر');
    }
  }
);
