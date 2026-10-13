"use client";

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowLeft, FileText, Package, RefreshCw, ShoppingCart, Users, Warehouse } from 'lucide-react';
import { api } from '@/lib/api';

type Json = Record<string, unknown> | unknown[] | null;

function readValue(source: Json, ...keys: string[]): number {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return 0;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    if (typeof record[key] === 'number' || typeof record[key] === 'string') return Number(record[key]) || 0;
    const matched = Object.keys(record).find((name) => name.toLowerCase() === key.toLowerCase());
    if (matched) return Number(record[matched]) || 0;
  }
  return 0;
}

const quickActions = [
  { href: '/admin/products', title: 'مدیریت محصولات', description: 'افزودن و ویرایش کالا', icon: Package },
  { href: '/admin/orders', title: 'سفارش‌ها', description: 'پیگیری وضعیت خریدها', icon: ShoppingCart },
  { href: '/admin/inventory', title: 'موجودی انبار', description: 'کنترل سطح موجودی', icon: Warehouse },
  { href: '/admin/contents', title: 'محتوا و مقالات', description: 'انتشار محتوای جدید', icon: FileText },
] as const;

export function Dashboard() {
  const [stats, setStats] = useState<Json>(null);
  const [trends, setTrends] = useState<Json>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState('—');
  const [apiState, setApiState] = useState<'checking' | 'online' | 'offline'>('checking');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsResponse, trendsResponse] = await Promise.all([api('api/dashboard/stats'), api('api/dashboard/trends')]);
      setStats(statsResponse as Json);
      setTrends(trendsResponse as Json);
      setApiState('online');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'خطا در ارتباط با API داشبورد');
      setApiState('offline');
    } finally {
      setLoading(false);
      setUpdatedAt(new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }));
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const cards = useMemo(() => [
    { label: 'درآمد ماه جاری', value: readValue(stats, 'monthlyRevenue') / 10, money: true, icon: Activity },
    { label: 'سفارش‌های در انتظار', value: readValue(stats, 'ordersPending'), icon: ShoppingCart },
    { label: 'کاربران', value: readValue(stats, 'totalUsers', 'usersCount'), icon: Users },
    { label: 'سفارش امروز', value: readValue(stats, 'todayOrders', 'ordersToday'), icon: ShoppingCart },
    { label: 'کم‌موجود', value: readValue(stats, 'lowStockProducts', 'lowStockCount'), icon: Warehouse },
  ], [stats]);

  return (
    <div className="page">
      <div className="page-head">
        <div><div className="eyebrow">نمای کلی</div><h1>داشبورد مدیریتی</h1><p>تصویر زنده از شاخص‌های کلیدی و وضعیت فروشگاه Carnix.</p></div>
        <button className="ghost" type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''} /> بروزرسانی</button>
      </div>
      {error ? <div className="error-state card"><b>داشبورد در دسترس نیست</b><span>{error}</span><button className="primary" type="button" onClick={() => void load()}>تلاش دوباره</button></div> : loading ? <div className="loading card"><i /><span>در حال دریافت اطلاعات داشبورد...</span></div> : <>
        <div className="stats-grid">{cards.map(({ label, value, money, icon: Icon }) => <div className="stat-card" key={label}><span>{label}</span><strong>{value.toLocaleString('fa-IR')}{money && <small> تومان</small>}</strong><i><Icon size={17} /></i></div>)}</div>
        <div className="quick-card card"><header><div><b>دسترسی سریع</b><span>کارهای پرتکرار را از همین‌جا شروع کنید.</span></div></header><div className="quick-actions">{quickActions.map(({ href, title, description, icon: Icon }) => <Link className="quick-action" href={href} key={href}><Icon size={20} /><span><strong>{title}</strong><small>{description}</small></span><ArrowLeft size={15} /></Link>)}</div></div>
        <div className="dash-grid"><div className="card trend-card"><header><div><b>روند ۳۰ روزه</b><span>خروجی مستقیم از API داشبورد</span></div></header><Trend data={trends} /></div><div className="card api-health"><h3>وضعیت پنل</h3><div><span>احراز هویت</span><b className="good">نشست معتبر</b></div><div><span>Dashboard API</span><b className={apiState === 'online' ? 'good' : apiState === 'offline' ? 'bad' : ''}>{apiState === 'online' ? 'متصل' : apiState === 'offline' ? 'خطا در اتصال' : 'در حال بررسی'}</b></div><div><span>رابط کاربری</span><b>Next.js / RTL</b></div><div><span>زمان آخرین بروزرسانی</span><b>{updatedAt}</b></div></div></div>
      </>}
    </div>
  );
}

function Trend({ data }: { data: Json }) {
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data as Record<string, unknown> : null;
  const raw = Array.isArray(data) ? data : source?.salesTrend || source?.orderTrend || source?.dailySales || source?.data;
  const values = Array.isArray(raw) ? raw.slice(-30).map((item) => typeof item === 'number' ? item : Number((item as Record<string, unknown>)?.value ?? (item as Record<string, unknown>)?.amount ?? (item as Record<string, unknown>)?.sales ?? (item as Record<string, unknown>)?.total ?? (item as Record<string, unknown>)?.count ?? 0)) : [];
  if (!values.length) return <div className="empty-state">هنوز داده‌ای برای نمایش روند وجود ندارد.</div>;
  const max = Math.max(...values, 1), width = 720, height = 220;
  const path = values.map((value, index) => `${index ? 'L' : 'M'} ${(index / Math.max(values.length - 1, 1)) * width} ${height - (value / max) * (height - 30) - 15}`).join(' ');
  return <div className="trend"><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="نمودار روند ۳۰ روزه"><path d={path} /></svg><div className="trend-labels"><span>۳۰ روز قبل</span><span>امروز</span></div></div>;
}
