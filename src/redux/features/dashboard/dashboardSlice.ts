// src/redux/features/dashboard/dashboardSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  DashboardStats, 
  DashboardTrends, 
  SalesChartData, 
  UsersChartData, 
  Activity,
  DashboardApiResponse
} from '@/core/types/dashboard/dashboard';
import { dashboardApi } from '@/api/dasboard/home/routes';

// تعریف LiveStats بر اساس API
interface LiveStats {
  onlineUsers: number;
  pendingOrders: number;
  todayRevenue: number;
  systemHealth: number;
}

// اضافه کردن state جدید برای liveStats
interface DashboardState {
  stats: DashboardStats | null;
  trends: DashboardTrends | null;
  salesChart: SalesChartData[] | null;
  usersChart: UsersChartData[] | null;
  recentActivities: Activity[] | null;
  liveStats: LiveStats | null;
  notifications: any[] | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  exportLoading: boolean;
  exportError: string | null;
  summaryReport: any | null;
}

const initialState: DashboardState = {
  stats: null,
  trends: null,
  salesChart: null,
  usersChart: null,
  recentActivities: null,
  liveStats: null,
  notifications: null,
  loading: false,
  error: null,
  lastUpdated: null,
  exportLoading: false,
  exportError: null,
  summaryReport: null
};

// Thunk اصلی برای دریافت تمام داده‌های داشبورد
export const fetchAllDashboardData = createAsyncThunk(
  'dashboard/fetchAllDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getAllDashboardData();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'خطا در دریافت داده‌های داشبورد');
    }
  }
);

// Thunk برای دریافت آمار کلی
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'خطا در دریافت آمار داشبورد');
    }
  }
);

// Thunk برای دریافت روندها
export const fetchDashboardTrends = createAsyncThunk(
  'dashboard/fetchDashboardTrends',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getTrends();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'خطا در دریافت روندهای داشبورد');
    }
  }
);

// Thunk برای دریافت نمودار فروش
export const fetchSalesChart = createAsyncThunk(
  'dashboard/fetchSalesChart',
  async (period: 'daily' | 'weekly' | 'monthly' = 'monthly', { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getSalesChart(period);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'خطا در دریافت نمودار فروش');
    }
  }
);

// Thunk برای دریافت نمودار کاربران
export const fetchUsersChart = createAsyncThunk(
  'dashboard/fetchUsersChart',
  async (period: 'daily' | 'weekly' | 'monthly' = 'monthly', { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getUsersChart(period);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'خطا در دریافت نمودار کاربران');
    }
  }
);

// Thunk برای دریافت فعالیت‌های اخیر
export const fetchRecentActivities = createAsyncThunk(
  'dashboard/fetchRecentActivities',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getRecentActivities(limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'خطا در دریافت فعالیت‌های اخیر');
    }
  }
);

// Thunk جدید برای دریافت آمار لحظه‌ای
export const fetchLiveStats = createAsyncThunk(
  'dashboard/fetchLiveStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getLiveStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'خطا در دریافت آمار لحظه‌ای');
    }
  }
);

// Thunk جدید برای بروزرسانی داشبورد
export const refreshDashboard = createAsyncThunk(
  'dashboard/refreshDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.refreshDashboard();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'خطا در بروزرسانی داشبورد');
    }
  }
);

// Thunk جدید برای خروجی داده‌ها
export const exportDashboardData = createAsyncThunk(
  'dashboard/exportDashboardData',
  async (format: 'csv' | 'excel' | 'pdf', { rejectWithValue }) => {
    try {
      const response = await dashboardApi.exportDashboardData(format);
      return { data: response, format };
    } catch (error: any) {
      return rejectWithValue(error.message || 'خطا در خروجی گرفتن داده‌ها');
    }
  }
);

// Thunk جدید برای فیلتر فعالیت‌ها
export const filterActivities = createAsyncThunk(
  'dashboard/filterActivities',
  async (filters: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.filterActivities(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'خطا در فیلتر فعالیت‌ها');
    }
  }
);

// Thunk برای دریافت خلاصه گزارش
export const fetchSummaryReport = createAsyncThunk(
  'dashboard/fetchSummaryReport',
  async (params: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getSummaryReport(params.startDate, params.endDate);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'خطا در دریافت خلاصه گزارش');
    }
  }
);

// Thunk برای دریافت اعلان‌ها
export const fetchDashboardNotifications = createAsyncThunk(
  'dashboard/fetchDashboardNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getDashboardNotifications();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'خطا در دریافت اعلان‌ها');
    }
  }
);

// Thunk برای علامت‌گذاری اعلان به عنوان خوانده شده
export const markNotificationAsRead = createAsyncThunk(
  'dashboard/markNotificationAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.markNotificationAsRead(notificationId);
      return { notificationId, data: response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'خطا در علامت‌گذاری اعلان');
    }
  }
);

// Thunk برای پاک کردن همه اعلان‌ها
export const clearAllNotifications = createAsyncThunk(
  'dashboard/clearAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.clearAllNotifications();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'خطا در پاک کردن اعلان‌ها');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardErrors: (state) => {
      state.error = null;
      state.exportError = null;
    },
    setDashboardData: (state, action: PayloadAction<Partial<DashboardState>>) => {
      return { ...state, ...action.payload };
    },
    resetDashboard: () => initialState,
    // اضافه کردن reducer برای حذف اعلان محلی
    removeNotification: (state, action: PayloadAction<string>) => {
      if (state.notifications) {
        state.notifications = state.notifications.filter(
          notification => notification.id !== action.payload
        );
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAllDashboardData
      .addCase(fetchAllDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.stats = action.payload.data.stats;
          state.trends = action.payload.data.trends;
          state.salesChart = action.payload.data.salesChart;
          state.usersChart = action.payload.data.usersChart;
          state.recentActivities = action.payload.data.recentActivities;
          state.lastUpdated = action.payload.timestamp;
        } else {
          state.error = action.payload.error?.message || 'خطا در دریافت داده‌ها';
        }
      })
      .addCase(fetchAllDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'خطا در دریافت داده‌های داشبورد';
      })
      
      // fetchDashboardStats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.stats = action.payload.data;
          state.lastUpdated = new Date().toISOString();
        } else {
          state.error = action.payload.error?.message;
        }
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'خطا در دریافت آمار داشبورد';
      })
      
      // fetchDashboardTrends
      .addCase(fetchDashboardTrends.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardTrends.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.trends = action.payload.data;
          state.lastUpdated = new Date().toISOString();
        } else {
          state.error = action.payload.error?.message;
        }
      })
      .addCase(fetchDashboardTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'خطا در دریافت روندهای داشبورد';
      })
      
      // fetchSalesChart
      .addCase(fetchSalesChart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalesChart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.salesChart = action.payload.data;
          state.lastUpdated = new Date().toISOString();
        } else {
          state.error = action.payload.error?.message;
        }
      })
      .addCase(fetchSalesChart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'خطا در دریافت نمودار فروش';
      })
      
      // fetchUsersChart
      .addCase(fetchUsersChart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsersChart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.usersChart = action.payload.data;
          state.lastUpdated = new Date().toISOString();
        } else {
          state.error = action.payload.error?.message;
        }
      })
      .addCase(fetchUsersChart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'خطا در دریافت نمودار کاربران';
      })
      
      // fetchRecentActivities
      .addCase(fetchRecentActivities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.recentActivities = action.payload.data;
          state.lastUpdated = new Date().toISOString();
        } else {
          state.error = action.payload.error?.message;
        }
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'خطا در دریافت فعالیت‌های اخیر';
      })
      
      // fetchLiveStats
      .addCase(fetchLiveStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLiveStats.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.liveStats = action.payload.data;
          state.lastUpdated = new Date().toISOString();
        } else {
          state.error = action.payload.error?.message;
        }
      })
      .addCase(fetchLiveStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'خطا در دریافت آمار لحظه‌ای';
      })
      
      // refreshDashboard
      .addCase(refreshDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshDashboard.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.lastUpdated = new Date().toISOString();
        } else {
          state.error = action.payload.error?.message;
        }
      })
      .addCase(refreshDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'خطا در بروزرسانی داشبورد';
      })
      
      // exportDashboardData
      .addCase(exportDashboardData.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportDashboardData.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportDashboardData.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload as string || 'خطا در خروجی گرفتن داده‌ها';
      })
      
      // filterActivities
      .addCase(filterActivities.pending, (state) => {
        state.loading = true;
      })
      .addCase(filterActivities.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.recentActivities = action.payload.data;
        } else {
          state.error = action.payload.error?.message;
        }
      })
      .addCase(filterActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'خطا در فیلتر فعالیت‌ها';
      })
      
      // fetchSummaryReport
      .addCase(fetchSummaryReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSummaryReport.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.summaryReport = action.payload.data;
        } else {
          state.error = action.payload.error?.message;
        }
      })
      .addCase(fetchSummaryReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'خطا در دریافت خلاصه گزارش';
      })
      
      // fetchDashboardNotifications
      .addCase(fetchDashboardNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardNotifications.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.notifications = action.payload.data;
        } else {
          state.error = action.payload.error?.message;
        }
      })
      .addCase(fetchDashboardNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'خطا در دریافت اعلان‌ها';
      })
      
      // markNotificationAsRead
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        // به روز رسانی وضعیت اعلان در state محلی
        if (state.notifications) {
          const index = state.notifications.findIndex(
            notification => notification.id === action.payload.notificationId
          );
          if (index !== -1) {
            state.notifications[index] = {
              ...state.notifications[index],
              ...action.payload.data
            };
          }
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'خطا در علامت‌گذاری اعلان';
      })
      
      // clearAllNotifications
      .addCase(clearAllNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.loading = false;
        state.notifications = [];
      })
      .addCase(clearAllNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'خطا در پاک کردن اعلان‌ها';
      });
  }
});

export const { 
  clearDashboardErrors, 
  setDashboardData, 
  resetDashboard,
  removeNotification 
} = dashboardSlice.actions;

// Export all thunks
export {
  fetchAllDashboardData,
  fetchDashboardStats,
  fetchDashboardTrends,
  fetchSalesChart,
  fetchUsersChart,
  fetchRecentActivities,
  fetchLiveStats,
  refreshDashboard,
  exportDashboardData,
  filterActivities,
  fetchSummaryReport,
  fetchDashboardNotifications,
  markNotificationAsRead,
  clearAllNotifications
};

export default dashboardSlice.reducer;
