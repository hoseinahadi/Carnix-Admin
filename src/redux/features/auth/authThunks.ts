// src/redux/features/auth/authThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@/api/common/axiosInstance'
import { AxiosError } from 'axios'

// تعریف تایپ‌های متناظر با DTOهای بک‌اِند شما
interface UserDto {
  userId: number;
  userName: string;
  email: string;
  isActive: boolean;
}

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue, dispatch }) => {
    try {
      // 1. انجام عملیات لاگین
      const { data: loginData } = await axiosInstance.post<{ token: string; message: string }>(
        '/Auth/login',
        credentials
      )
      
      const token = loginData.token;
      localStorage.setItem('token', token);

      // 2. دریافت اطلاعات کاربر (UserDto)
      const userRes = await axiosInstance.get<{ user: UserDto }>('/Auth/me');
      const user = userRes.data.user;

      // 3. دریافت نقش‌های کاربر (خروجی متد GetUserRoles در کنترلر شما یک آرایه از اعداد است)
      const rolesRes = await axiosInstance.get<{ roles: number[] }>('/Auth/roles');
      const roleId = rolesRes.data.roles.length > 0 ? rolesRes.data.roles[0] : null;

      // 4. ذخیره در LocalStorage برای استفاده در PermissionManagement
      localStorage.setItem('UserId', user.userId.toString());
      localStorage.setItem('Username', user.userName);
      if (roleId) {
        localStorage.setItem('RoleId', roleId.toString());
      }

      return {
        token: token,
        user: user
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      return rejectWithValue(axiosError.response?.data?.message || 'خطا در ورود')
    }
  }
)

export const getCurrentUserThunk = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return rejectWithValue('No token')

      // دریافت مجدد اطلاعات کاربر و نقش‌ها برای آپدیت نگه داشتن استوریج
      const userRes = await axiosInstance.get<{ user: UserDto }>('/Auth/me');
      const rolesRes = await axiosInstance.get<{ roles: number[] }>('/Auth/roles');
      
      const user = userRes.data.user;
      const roleId = rolesRes.data.roles.length > 0 ? rolesRes.data.roles[0] : null;

      localStorage.setItem('UserId', user.userId.toString());
      localStorage.setItem('Username', user.userName);
      if (roleId) {
        localStorage.setItem('RoleId', roleId.toString());
      }

      return user;
    } catch (error) {
      return rejectWithValue('Invalid token')
    }
  }
)

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    await axiosInstance.post('/Auth/logout')
  } finally {
    // پاکسازی کامل تحت هر شرایطی
    localStorage.removeItem('token')
    localStorage.removeItem('UserId')
    localStorage.removeItem('RoleId')
    localStorage.removeItem('Username')
    localStorage.removeItem('RoleName')
  }
})
