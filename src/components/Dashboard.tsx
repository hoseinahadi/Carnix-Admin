"use client";

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowLeft, CheckCircle2, FileText, Headphones, Package, RefreshCw, Send, ShoppingCart, Truck, Users, Warehouse, X } from 'lucide-react';
import { api, unwrapData } from '@/lib/api';
import { useToast } from './Toast';

type Json = Record<string, unknown> | unknown[] | null;
type OperationsOverview = { orders: any[]; tickets: any[]; carriers: any[] };

function settleWithin<T>(request: Promise<T>, timeoutMs = 12000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error('مهلت دریافت اطلاعات این بخش به پایان رسید.')),
      timeoutMs,
    );
    request.then(
      value => { window.clearTimeout(timer); resolve(value); },
      error => { window.clearTimeout(timer); reject(error); },
    );
  });
}

const get = (source: any, key: string) => {
  if (!source || typeof source !== 'object') return undefined;
  if (source[key] !== undefined) return source[key];
  const match = Object.keys(source).find(item => item.toLowerCase() === key.toLowerCase());
  return match ? source[match] : undefined;
};
const money = (value: unknown) => (Number(value) / 10).toLocaleString('fa-IR');
const date = (value: unknown) => value ? new Date(String(value)).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

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
  const { show } = useToast();
  const [stats, setStats] = useState<Json>(null);
  const [trends, setTrends] = useState<Json>(null);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState('—');
  const [apiState, setApiState] = useState<'checking' | 'online' | 'offline'>('checking');
  const [operations, setOperations] = useState<OperationsOverview>({ orders: [], tickets: [], carriers: [] });
  const [carrierSelections, setCarrierSelections] = useState<Record<number, string>>({});
  const [invitingOrderId, setInvitingOrderId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketReply, setTicketReply] = useState('');
  const [ticketBusy, setTicketBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setWarning('');
    try {
      const [statsResult, trendsResult, operationsResult] = await Promise.allSettled([
        settleWithin(api('api/dashboard/stats')),
        settleWithin(api('api/dashboard/trends')),
        settleWithin(api('api/admin/operations/overview', { query: { orderCount: 8, ticketCount: 8 } })),
      ]);
      const failures: string[] = [];
      if (statsResult.status === 'fulfilled') setStats(statsResult.value as Json);
      else { setStats(null); failures.push('آمار'); }
      if (trendsResult.status === 'fulfilled') setTrends(trendsResult.value as Json);
      else { setTrends(null); failures.push('روند فروش'); }
      if (operationsResult.status === 'fulfilled') {
        const value = unwrapData(operationsResult.value) as Partial<OperationsOverview> | null;
        setOperations({ orders: value?.orders ?? [], tickets: value?.tickets ?? [], carriers: value?.carriers ?? [] });
      } else {
        setOperations({ orders: [], tickets: [], carriers: [] });
        failures.push('عملیات سفارش و پشتیبانی');
      }
      const successCount = 3 - failures.length;
      setApiState(successCount ? 'online' : 'offline');
      if (!successCount) setError('ارتباط با سرویس‌های داشبورد برقرار نشد.');
      else if (failures.length) setWarning(`بخش‌های ${failures.join('، ')} موقتاً دریافت نشدند؛ سایر بخش‌ها همچنان قابل استفاده‌اند.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'خطا در ارتباط با API داشبورد');
      setApiState('offline');
    } finally {
      setLoading(false);
      setUpdatedAt(new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }));
    }
  }, []);

  const inviteCarrier = async (orderId: number) => {
    const carrierId = Number(carrierSelections[orderId]);
    if (!carrierId || invitingOrderId !== null) return;
    setInvitingOrderId(orderId);
    try {
      const response = await api<any>(`api/admin/operations/orders/${orderId}/invite-carrier`, { method: 'POST', body: { carrierId } });
      show(response?.message || 'دعوت‌نامه برای پیک ارسال شد.');
      await load();
    } catch (cause) { show(cause instanceof Error ? cause.message : 'دعوت پیک انجام نشد.', 'error'); }
    finally { setInvitingOrderId(null); }
  };

  const openTicket = async (ticketId: number) => {
    try { setSelectedTicket(unwrapData(await api(`api/admin/operations/tickets/${ticketId}`))); setTicketReply(''); }
    catch (cause) { show(cause instanceof Error ? cause.message : 'دریافت تیکت انجام نشد.', 'error'); }
  };

  const sendTicketReply = async () => {
    if (!selectedTicket || !ticketReply.trim() || ticketBusy) return;
    setTicketBusy(true);
    try {
      await api(`api/admin/operations/tickets/${get(selectedTicket, 'customerTicketId')}/replies`, { method: 'POST', body: { body: ticketReply.trim() } });
      show('پاسخ تیکت ارسال شد.');
      await openTicket(Number(get(selectedTicket, 'customerTicketId')));
      await load();
    } catch (cause) { show(cause instanceof Error ? cause.message : 'ارسال پاسخ انجام نشد.', 'error'); }
    finally { setTicketBusy(false); }
  };

  const changeTicketStatus = async (status: 'open' | 'answered' | 'closed') => {
    if (!selectedTicket || ticketBusy) return;
    setTicketBusy(true);
    try {
      await api(`api/admin/operations/tickets/${get(selectedTicket, 'customerTicketId')}/status`, { method: 'PATCH', body: { status } });
      show('وضعیت تیکت تغییر کرد.');
      await openTicket(Number(get(selectedTicket, 'customerTicketId')));
      await load();
    } catch (cause) { show(cause instanceof Error ? cause.message : 'تغییر وضعیت انجام نشد.', 'error'); }
    finally { setTicketBusy(false); }
  };

  useEffect(() => { void load(); }, [load]);

  const cards = useMemo(() => [
    { label: 'درآمد ماه جاری', value: readValue(stats, 'monthlyRevenue') / 10, money: true, icon: Activity },
    { label: 'سفارش‌های در انتظار', value: readValue(stats, 'ordersPending'), icon: ShoppingCart },
    { label: 'کاربران', value: readValue(stats, 'totalUsers', 'usersCount'), icon: Users },
    { label: 'سفارش امروز', value: readValue(stats, 'todayOrders', 'ordersToday'), icon: ShoppingCart },
    { label: 'کم‌موجود', value: readValue(stats, 'lowStockProducts', 'lowStockCount'), icon: Warehouse },
  ], [stats]);

  const priorities = useMemo(() => {
    const pendingOrders = readValue(stats, 'ordersPending');
    const lowStock = readValue(stats, 'lowStockProducts', 'lowStockCount');
    const openTickets = operations.tickets.filter(ticket => get(ticket, 'status') !== 'closed').length;
    return [
      { label: 'سفارش منتظر اقدام', value: pendingOrders, href: '/admin/orders', icon: ShoppingCart, tone: 'lilac' },
      { label: 'کالای کم‌موجود', value: lowStock, href: '/admin/inventory', icon: Warehouse, tone: 'peach' },
      { label: 'تیکت نیازمند پاسخ', value: openTickets, href: '/admin/tickets', icon: Headphones, tone: 'mint' },
    ];
  }, [stats, operations.tickets]);

  return (
    <div className="page">
      <div className="page-head">
        <div><div className="eyebrow">نمای کلی</div><h1>داشبورد مدیریتی</h1><p>تصویر زنده از شاخص‌های کلیدی و وضعیت فروشگاه Carnix.</p></div>
        <button className="ghost" type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''} /> بروزرسانی</button>
      </div>
      {error ? <div className="error-state card"><b>داشبورد در دسترس نیست</b><span>{error}</span><button className="primary" type="button" onClick={() => void load()}>تلاش دوباره</button></div> : loading ? <DashboardSkeleton /> : <>
        {warning && <div className="dashboard-warning" role="status">{warning}</div>}
        <section className="priority-board card" aria-labelledby="priority-title">
          <header><div><span className="priority-icon"><Activity size={18} /></span><span><b id="priority-title">کارهای امروز</b><small>مهم‌ترین مواردی که به اقدام مدیر نیاز دارند</small></span></div><span className="priority-summary">{priorities.reduce((sum, item) => sum + item.value, 0).toLocaleString('fa-IR')} مورد</span></header>
          <div className="priority-grid">{priorities.map(({ label, value, href, icon: Icon, tone }) => <Link href={href} className="priority-item" data-tone={tone} key={label}><i><Icon size={18} /></i><span><small>{label}</small><strong>{value.toLocaleString('fa-IR')}</strong></span>{value === 0 ? <CheckCircle2 className="priority-done" size={18} /> : <ArrowLeft size={17} />}</Link>)}</div>
        </section>
        <div className="stats-grid">{cards.map(({ label, value, money, icon: Icon }) => <div className="stat-card" key={label}><span>{label}</span><strong>{value.toLocaleString('fa-IR')}{money && <small> تومان</small>}</strong><i><Icon size={17} /></i></div>)}</div>
        <div className="quick-card card"><header><div><b>دسترسی سریع</b><span>کارهای پرتکرار را از همین‌جا شروع کنید.</span></div></header><div className="quick-actions">{quickActions.map(({ href, title, description, icon: Icon }) => <Link className="quick-action" href={href} key={href}><Icon size={20} /><span><strong>{title}</strong><small>{description}</small></span><ArrowLeft size={15} /></Link>)}</div></div>
        <section className="operations-overview" aria-label="عملیات روزانه">
          <article className="card operations-card">
            <header><div><ShoppingCart size={20} /><span><b>سفارش‌های اخیر</b><small>اقلام و تخصیص پیک</small></span></div><Link href="/admin/orders">مدیریت همه <ArrowLeft size={15} /></Link></header>
            <div className="operations-list">{operations.orders.length ? operations.orders.map(order => {
              const orderId = Number(get(order, 'orderId'));
              const items = get(order, 'items') || [];
              const shipment = get(order, 'shipment');
              return <section className="operation-row order-operation" key={orderId}>
                <div className="operation-title"><span><b>سفارش {get(order, 'orderNumber') || orderId}</b><small>کاربر {get(order, 'userId')} · {date(get(order, 'createdAt'))}</small></span><strong>{money(get(order, 'grandTotal'))} تومان</strong></div>
                <div className="order-items-preview">{items.map((item: any) => <span key={get(item, 'orderItemId')} title={get(item, 'productName')}><Package size={14} />{get(item, 'productName') || `محصول ${get(item, 'productId')}`} <b>× {get(item, 'quantity')}</b></span>)}</div>
                <div className="carrier-line"><Truck size={16} /><select aria-label={`انتخاب پیک سفارش ${orderId}`} disabled={invitingOrderId !== null} value={carrierSelections[orderId] ?? get(shipment, 'shippingCarrierId') ?? ''} onChange={event => setCarrierSelections(current => ({ ...current, [orderId]: event.target.value }))}><option value="">انتخاب پیک</option>{operations.carriers.map(carrier => <option disabled={!get(carrier, 'isAvailable')} key={get(carrier, 'shippingCarrierId')} value={get(carrier, 'shippingCarrierId')}>{get(carrier, 'name')}{!get(carrier, 'isAvailable') ? ' (غیرفعال)' : ''}</option>)}</select><button type="button" disabled={!carrierSelections[orderId] || invitingOrderId !== null} onClick={() => void inviteCarrier(orderId)}>{invitingOrderId === orderId ? 'در حال ارسال…' : 'ارسال دعوت'}</button><Link className="table-button" href={`/admin/orders?orderId=${orderId}`}>مدیریت سفارش</Link></div>
              </section>;
            }) : <p className="operations-empty">سفارش جدیدی وجود ندارد.</p>}</div>
          </article>
          <article className="card operations-card">
            <header><div><Headphones size={20} /><span><b>تیکت‌های پشتیبانی</b><small>صف پاسخ‌گویی و پیگیری</small></span></div></header>
            <div className="operations-list">{operations.tickets.length ? operations.tickets.map(ticket => <button type="button" className="operation-row ticket-operation" key={get(ticket, 'customerTicketId')} onClick={() => void openTicket(Number(get(ticket, 'customerTicketId')))}><span><b>{get(ticket, 'subject')}</b><small>کاربر {get(ticket, 'userId')} · {date(get(ticket, 'updatedAt') || get(ticket, 'createdAt'))}</small></span><i data-status={get(ticket, 'status')}>{get(ticket, 'status') === 'answered' ? 'پاسخ داده‌شده' : get(ticket, 'status') === 'closed' ? 'بسته' : 'باز'}</i></button>) : <p className="operations-empty">تیکت بازی وجود ندارد.</p>}</div>
          </article>
        </section>
        <div className="dash-grid"><div className="card trend-card"><header><div><b>روند ۳۰ روزه</b><span>خروجی مستقیم از API داشبورد</span></div></header><Trend data={trends} /></div><div className="card api-health"><h3>وضعیت پنل</h3><div><span>احراز هویت</span><b className="good">نشست معتبر</b></div><div><span>Dashboard API</span><b className={apiState === 'online' ? 'good' : apiState === 'offline' ? 'bad' : ''}>{apiState === 'online' ? 'متصل' : apiState === 'offline' ? 'خطا در اتصال' : 'در حال بررسی'}</b></div><div><span>رابط کاربری</span><b>Next.js / RTL</b></div><div><span>زمان آخرین بروزرسانی</span><b>{updatedAt}</b></div></div></div>
        {selectedTicket && <div className="drawer-layer" role="presentation" onMouseDown={() => setSelectedTicket(null)}><aside className="drawer ticket-drawer" role="dialog" aria-modal="true" aria-labelledby="admin-ticket-title" onMouseDown={event => event.stopPropagation()}><header><div><b id="admin-ticket-title">{get(selectedTicket, 'subject')}</b><span>تیکت #{get(selectedTicket, 'customerTicketId')} · کاربر {get(selectedTicket, 'userId')}</span></div><button type="button" aria-label="بستن" onClick={() => setSelectedTicket(null)}><X size={18} /></button></header><div className="ticket-drawer-content"><div className="ticket-toolbar"><select aria-label="وضعیت تیکت" value={get(selectedTicket, 'status')} disabled={ticketBusy} onChange={event => void changeTicketStatus(event.target.value as 'open' | 'answered' | 'closed')}><option value="open">باز</option><option value="answered">پاسخ داده‌شده</option><option value="closed">بسته</option></select></div><div className="ticket-conversation"><article data-support="false"><b>کاربر</b><time>{date(get(selectedTicket, 'createdAt'))}</time><p>{get(selectedTicket, 'message')}</p></article>{(get(selectedTicket, 'replies') || []).map((reply: any) => <article key={get(reply, 'customerTicketReplyId')} data-support={String(Boolean(get(reply, 'isFromSupport')))}><b>{get(reply, 'isFromSupport') ? 'پشتیبانی' : 'کاربر'}</b><time>{date(get(reply, 'createdAt'))}</time><p>{get(reply, 'body')}</p></article>)}</div>{get(selectedTicket, 'status') !== 'closed' && <div className="ticket-reply"><textarea rows={5} value={ticketReply} disabled={ticketBusy} onChange={event => setTicketReply(event.target.value)} placeholder="پاسخ پشتیبانی را بنویسید…"/><button className="primary" type="button" disabled={!ticketReply.trim() || ticketBusy} onClick={() => void sendTicketReply()}><Send size={16} />ارسال پاسخ</button></div>}</div></aside></div>}
      </>}
    </div>
  );
}

function DashboardSkeleton() {
  return <div className="dashboard-skeleton" aria-label="در حال دریافت اطلاعات داشبورد" aria-busy="true">
    <div className="skeleton-priority skeleton-shimmer" />
    <div className="skeleton-stats">{Array.from({ length: 5 }, (_, index) => <div className="skeleton-shimmer" key={index} />)}</div>
    <div className="skeleton-panels"><div className="skeleton-shimmer" /><div className="skeleton-shimmer" /></div>
  </div>;
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
// Test
