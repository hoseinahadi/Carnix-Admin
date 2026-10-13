// انواع TypeScript برای داشبورد

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  activeUsers: number;
  pendingOrders: number;
  conversionRate: number;
  growthRate: number;
}

export interface DashboardTrends {
  dailyRevenue: number[];
  weeklyOrders: number[];
  monthlyUsers: number[];
  quarterlyGrowth: number[];
  labels: string[];
}

export interface SalesChartData {
  date: string;
  sales: number;
  revenue: number;
}

export interface UsersChartData {
  month: string;
  newUsers: number;
  activeUsers: number;
  totalUsers: number;
}

export interface Activity {
  id: string;
  type: 'user' | 'order' | 'payment' | 'message';
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  timestamp: string;
  status: 'success' | 'pending' | 'error';
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  variant: 'default' | 'secondary' | 'outline' | 'ghost';
  onClick: () => void;
  badge?: string;
  disabled?: boolean;
}

export interface DashboardApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface DashboardError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
// اضافه کردن نوع‌های جدید
export interface LiveStats {
  onlineUsers: number;
  pendingOrders: number;
  todayRevenue: number;
  systemHealth: number;
  lastUpdated: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeCharts: boolean;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface FilterOptions {
  dateRange?: {
    start: string;
    end: string;
  };
  chartType?: 'line' | 'bar' | 'pie';
  groupBy?: 'day' | 'week' | 'month';
  metrics?: string[];
}

// اضافه کردن نوع برای پاسخ API
export interface DashboardApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// اضافه کردن نوع برای داده‌های ترکیبی
export interface CombinedDashboardData {
  stats: DashboardStats;
  trends: DashboardTrends;
  salesChart: SalesChartData[];
  usersChart: UsersChartData[];
  recentActivities: Activity[];
  liveStats?: LiveStats;
  notifications?: Notification[];
}
