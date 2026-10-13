import  axiosInstance  from '@/api/common/axiosInstance';
import {
  DashboardStats,
  DashboardTrends,
  SalesChartData,
  UsersChartData,
  Activity,
  DashboardApiResponse
} from '../../../core/types/dashboard/dashboard';

// گروه‌بندی APIهای داشبورد
export const dashboardApi = {
  // آمار کلی
  getStats: async (): Promise<DashboardApiResponse<DashboardStats>> => {
    const response = await axiosInstance.get('/dashboard/stats');
    return response.data;
  },

  // روندها
  getTrends: async (): Promise<DashboardApiResponse<DashboardTrends>> => {
    const response = await axiosInstance.get('/dashboard/trends');
    return response.data;
  },

    // نمودار فروش
  getSalesChart: async (period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<DashboardApiResponse<SalesChartData[]>> => {
    const response = await axiosInstance.get('/dashboard/charts/sales', {
      params: { period }
    });
    return response.data;
  },

  // نمودار کاربران
  getUsersChart: async (period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<DashboardApiResponse<UsersChartData[]>> => {
    const response = await axiosInstance.get('/dashboard/charts/users', {
      params: { period }
    });
    return response.data;
  },

  // فعالیت‌های اخیر
  getRecentActivities: async (limit: number = 10): Promise<DashboardApiResponse<Activity[]>> => {
    const response = await axiosInstance.get('/dashboard/activities/recent', {
      params: { limit }
    });
    return response.data;
  },

  // داده‌های ترکیبی داشبورد
  getAllDashboardData: async () => {
    try {
      const [stats, trends, salesChart, usersChart, recentActivities] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getTrends(),
        dashboardApi.getSalesChart(),
        dashboardApi.getUsersChart(),
        dashboardApi.getRecentActivities()
      ]);

      return {
        success: true,
        data: {
          stats: stats.data,
          trends: trends.data,
          salesChart: salesChart.data,
          usersChart: usersChart.data,
          recentActivities: recentActivities.data
        },
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'DASHBOARD_FETCH_ERROR',
          message: error.response?.data?.message || 'خطا در دریافت داده‌های داشبورد',
          details: error.response?.data
        },
        timestamp: new Date().toISOString()
      };
    }
  },

  // بروزرسانی داشبورد
  refreshDashboard: async (): Promise<DashboardApiResponse<{ refreshed: boolean }>> => {
    const response = await axiosInstance.post('/dashboard/refresh');
    return response.data;
  },

  // دریافت خلاصه گزارش
  getSummaryReport: async (startDate?: string, endDate?: string) => {
    const response = await axiosInstance.get('/dashboard/reports/summary', {
      params: {
        startDate,
        endDate
      }
    });
    return response.data;
  },

  // دریافت آمار لحظه‌ای
  getLiveStats: async (): Promise<DashboardApiResponse<{
    onlineUsers: number;
    pendingOrders: number;
    todayRevenue: number;
    systemHealth: number;
  }>> => {
    const response = await axiosInstance.get('/dashboard/stats/live');
    return response.data;
  },

  // فیلتر فعالیت‌ها
  filterActivities: async (filters: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }): Promise<DashboardApiResponse<Activity[]>> => {
    const response = await axiosInstance.get('/dashboard/activities/filter', {
      params: filters
    });
    return response.data;
  },

  // خروجی داده‌های داشبورد
  exportDashboardData: async (format: 'csv' | 'excel' | 'pdf' = 'excel') => {
    const response = await axiosInstance.get('/dashboard/export', {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // دریافت اعلان‌های داشبورد
  getDashboardNotifications: async () => {
    const response = await axiosInstance.get('/dashboard/notifications');
    return response.data;
  },

  // علامت‌گذاری اعلان به عنوان خوانده شده
  markNotificationAsRead: async (notificationId: string) => {
    const response = await axiosInstance.patch(`/dashboard/notifications/${notificationId}/read`);
    return response.data;
  },

  // پاک کردن همه اعلان‌ها
  clearAllNotifications: async () => {
    const response = await axiosInstance.delete('/dashboard/notifications');
    return response.data;
  }
};
