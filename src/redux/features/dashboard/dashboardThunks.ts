import { createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from '@/api/dasboard/home/routes';
import { 
  DashboardStats, 
  DashboardTrends, 
  SalesChartData, 
  UsersChartData, 
  Activity 
} from '@/core/types/dashboard/dashboard';

// Thunk اصلی برای دریافت همه داده‌های داشبورد
export const fetchAllDashboardData = createAsyncThunk(
  'dashboard/fetchAllDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getAllDashboardData();
      return response;
    } catch (error: any) {
      return rejectWithValue({
        success: false,
        error: {
          code: 'FETCH_ALL_ERROR',
          message: error.response?.data?.message || 'خطا در دریافت همه داده‌های داشبورد',
          details: error.response?.data
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Thunk برای دریافت آمار اصلی
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت آمار');
    }
  }
);

// Thunk برای دریافت روندها
export const fetchDashboardTrends = createAsyncThunk(
  'dashboard/fetchTrends',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getTrends();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت روندها');
    }
  }
);

// Thunk برای دریافت نمودار فروش
export const fetchSalesChart = createAsyncThunk(
  'dashboard/fetchSalesChart',
  async (period: 'daily' | 'weekly' | 'monthly' = 'monthly', { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getSalesChart(period);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت نمودار فروش');
    }
  }
);

// Thunk برای دریافت نمودار کاربران
export const fetchUsersChart = createAsyncThunk(
  'dashboard/fetchUsersChart',
  async (period: 'daily' | 'weekly' | 'monthly' = 'monthly', { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getUsersChart(period);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت نمودار کاربران');
    }
  }
);

// Thunk برای دریافت فعالیت‌های اخیر
export const fetchRecentActivities = createAsyncThunk(
  'dashboard/fetchRecentActivities',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getRecentActivities(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت فعالیت‌های اخیر');
    }
  }
);

// Thunk برای دریافت گزارش خلاصه
export const fetchSummaryReport = createAsyncThunk(
  'dashboard/fetchSummaryReport',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getSummaryReport(startDate, endDate);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت گزارش خلاصه');
    }
  }
);

// Thunk برای دریافت اعلان‌ها
export const fetchDashboardNotifications = createAsyncThunk(
  'dashboard/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getDashboardNotifications();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت اعلان‌ها');
    }
  }
);

// Thunk برای علامت‌گذاری اعلان به عنوان خوانده شده
export const markNotificationAsRead = createAsyncThunk(
  'dashboard/markNotificationAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.markNotificationAsRead(notificationId);
      return { notificationId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در بروزرسانی اعلان');
    }
  }
);

// Thunk برای پاک کردن همه اعلان‌ها
export const clearAllNotifications = createAsyncThunk(
  'dashboard/clearAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.clearAllNotifications();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در پاک کردن اعلان‌ها');
    }
  }
);
