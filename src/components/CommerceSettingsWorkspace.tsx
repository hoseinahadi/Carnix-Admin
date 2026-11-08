'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Banknote, CheckCircle2, CircleDollarSign, RefreshCw, Search, Truck, XCircle } from 'lucide-react';
import { api, unwrapList } from '@/lib/api';
import { useToast } from './Toast';

type Row = Record<string, unknown>;

const read = (row: Row, ...keys: string[]) => {
  for (const key of keys) {
    const actual = Object.keys(row).find((name) => name.toLowerCase() === key.toLowerCase());
    if (actual && row[actual] !== undefined) return row[actual];
  }
  return undefined;
};

const active = (row: Row) => read(row, 'isActive', 'active') !== false;
const money = (value: unknown) => Number(value || 0).toLocaleString('fa-IR');

export function CommerceSettingsWorkspace() {
  const { show } = useToast();
  const [shipping, setShipping] = useState<Row[]>([]);
  const [payments, setPayments] = useState<Row[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [shippingResponse, paymentResponse] = await Promise.all([
        api('api/ShippingMethod/GetAll'),
        api('api/PaymentMethod'),
      ]);
      setShipping(unwrapList(shippingResponse));
      setPayments(unwrapList(paymentResponse));
    } catch (cause: any) {
      show(cause.message || 'دریافت تنظیمات ارسال و پرداخت انجام نشد.', 'error');
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => { void load(); }, [load]);

  const normalized = query.trim().toLocaleLowerCase('fa-IR');
  const matches = (row: Row) => !normalized || `${read(row, 'name', 'title') ?? ''} ${read(row, 'description') ?? ''}`.toLocaleLowerCase('fa-IR').includes(normalized);
  const visibleShipping = useMemo(() => shipping.filter(matches), [shipping, normalized]);
  const visiblePayments = useMemo(() => payments.filter(matches), [payments, normalized]);
  const activeShipping = shipping.filter(active).length;
  const activePayments = payments.filter(active).length;

  return <>
    <div className="page-head commerce-page-head">
      <div><div className="eyebrow">تنظیمات فروشگاه</div><h1>ارسال و پرداخت</h1><p>روش‌های تحویل و پرداخت را در یک نمای واحد بررسی کنید؛ وضعیت غیرفعال یا هزینه‌های ارسال بدون رفت‌وآمد بین صفحه‌ها مشخص است.</p></div>
      <button type="button" className="ghost" disabled={loading} onClick={() => void load()}><RefreshCw size={16}/>{loading ? 'در حال دریافت…' : 'به‌روزرسانی'}</button>
    </div>
    <div className="commerce-summary">
      <article><Truck/><span><small>روش ارسال فعال</small><b>{activeShipping.toLocaleString('fa-IR')} از {shipping.length.toLocaleString('fa-IR')}</b></span></article>
      <article><CircleDollarSign/><span><small>روش پرداخت فعال</small><b>{activePayments.toLocaleString('fa-IR')} از {payments.length.toLocaleString('fa-IR')}</b></span></article>
      <article><Banknote/><span><small>کمترین هزینه ارسال</small><b>{shipping.length ? `${money(Math.min(...shipping.map(row => Number(read(row, 'baseCost') || 0))))} ریال` : '—'}</b></span></article>
    </div>
    <div className="commerce-toolbar card"><div className="searchbox"><Search size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="جست‌وجوی روش ارسال یا پرداخت…" aria-label="جست‌وجوی تنظیمات ارسال و پرداخت"/></div><span>{(visibleShipping.length + visiblePayments.length).toLocaleString('fa-IR')} مورد نمایش داده می‌شود</span></div>
    {loading ? <div className="loading card"><i/><span>در حال دریافت تنظیمات فروشگاه…</span></div> : <div className="commerce-settings-grid">
      <section className="card commerce-panel"><header><div><Truck size={20}/><span><b>روش‌های ارسال</b><small>نحوه و هزینه تحویل سفارش</small></span></div><strong>{visibleShipping.length.toLocaleString('fa-IR')}</strong></header><div className="commerce-list">{visibleShipping.length ? visibleShipping.map((row, index) => <article key={String(read(row, 'shippingMethodId', 'id') ?? index)}><div className="commerce-state" data-active={active(row)}>{active(row) ? <CheckCircle2/> : <XCircle/>}</div><div><b>{String(read(row, 'name', 'title') ?? `روش ارسال ${index + 1}`)}</b><p>{String(read(row, 'description') ?? 'توضیحی ثبت نشده است.')}</p></div><span className="commerce-price">{money(read(row, 'baseCost'))}<small>ریال</small></span></article>) : <div className="empty small">روش ارسالی با این عبارت پیدا نشد.</div>}</div></section>
      <section className="card commerce-panel"><header><div><CircleDollarSign size={20}/><span><b>روش‌های پرداخت</b><small>درگاه‌ها و گزینه‌های پرداخت سفارش</small></span></div><strong>{visiblePayments.length.toLocaleString('fa-IR')}</strong></header><div className="commerce-list">{visiblePayments.length ? visiblePayments.map((row, index) => <article key={String(read(row, 'paymentMethodId', 'id') ?? index)}><div className="commerce-state" data-active={active(row)}>{active(row) ? <CheckCircle2/> : <XCircle/>}</div><div><b>{String(read(row, 'name', 'title') ?? `روش پرداخت ${index + 1}`)}</b><p>{String(read(row, 'description') ?? (active(row) ? 'این روش در فرایند ثبت سفارش در دسترس است.' : 'این روش فعلاً غیرفعال است.'))}</p></div><span className={`badge ${active(row) ? 'ok' : 'muted'}`}>{active(row) ? 'فعال' : 'غیرفعال'}</span></article>) : <div className="empty small">روش پرداختی با این عبارت پیدا نشد.</div>}</div></section>
    </div>}
  </>;
}
