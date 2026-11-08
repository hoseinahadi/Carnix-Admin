'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarDays, ChevronLeft, CircleDollarSign, Search } from 'lucide-react';
import { api, API_BASE, unwrapData, unwrapList } from '@/lib/api';
import styles from './PriceHistoryWorkspace.module.scss';

type Product = { productId: number; productName: string; productCode?: string; imageUrl?: string; images?: { imageUrl?: string; isMain?: boolean; displayOrder?: number }[]; basePrice?: number };
type History = { productId: number; oldPrice: number; newPrice: number; changeDate: string; oldDiscountedPrice?: number | null; newDiscountedPrice?: number | null };

function field<T = unknown>(record: Record<string, unknown> | undefined, ...keys: string[]): T | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const actual = Object.keys(record).find(candidate => candidate.toLowerCase() === key.toLowerCase());
    if (actual && record[actual] !== undefined && record[actual] !== null) return record[actual] as T;
  }
  return undefined;
}

function normalizeProduct(value: Record<string, unknown>): Product {
  const rawImages = field<unknown[]>(value, 'images', 'productImages') ?? [];
  const images = Array.isArray(rawImages) ? rawImages.map(image => {
    const row = image as Record<string, unknown>;
    return { imageUrl: field<string>(row, 'imageUrl', 'mediaUrl'), isMain: Boolean(field(row, 'isMain', 'isPrimary')), displayOrder: Number(field(row, 'displayOrder') ?? 0) };
  }).filter(image => !!image.imageUrl).sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.displayOrder - b.displayOrder) : [];
  return {
    productId: Number(field(value, 'productId', 'id')),
    productName: String(field(value, 'productName', 'name') ?? 'محصول بدون نام'),
    productCode: String(field(value, 'productCode', 'code') ?? ''),
    imageUrl: images[0]?.imageUrl || String(field(value, 'imageUrl') ?? ''),
    images,
    basePrice: Number(field(value, 'basePrice') ?? 0),
  };
}

function imageSrc(value?: string) {
  if (!value) return '';
  return /^(https?:|data:|blob:)/i.test(value) ? value : `${API_BASE}/${value.replace(/^\/+/, '')}`;
}

function money(value: number) { return `${Number(value || 0).toLocaleString('fa-IR')} ریال`; }
function dateLabel(value: Date, options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }) {
  return value.toLocaleDateString('fa-IR', options);
}

export function PriceHistoryWorkspace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');

  useEffect(() => {
    let active = true;
    setLoadingProducts(true); setProductsError('');
    api<any>('api/Product/filtered', { query: { page, pageSize: 50, includeInactive: true, sortBy: 'name-asc' } })
      .then(response => {
        const data = unwrapData(response);
        const rows = unwrapList(data).map((value: Record<string, unknown>) => normalizeProduct(value)).filter((product: Product) => product.productId > 0);
        if (!active) return;
        setProducts(rows);
        setPageCount(Math.max(1, Number(field(data, 'totalPages', 'TotalPages') ?? 1)));
        setSelected(current => current && rows.some(product => product.productId === current.productId) ? current : rows[0] ?? null);
      })
      .catch(error => { if (active) setProductsError(error instanceof Error ? error.message : 'دریافت فهرست محصولات ناموفق بود.'); })
      .finally(() => { if (active) setLoadingProducts(false); });
    return () => { active = false; };
  }, [page]);

  useEffect(() => {
    if (!selected) { setHistory([]); return; }
    let active = true;
    setLoadingHistory(true); setHistoryError('');
    api<any>(`api/ProductPricing/${selected.productId}/price-history`)
      .then(response => {
        if (!active) return;
        const rows = unwrapList(unwrapData(response)).map((value: Record<string, unknown>) => ({
          productId: Number(field(value, 'productId') ?? selected.productId),
          oldPrice: Number(field(value, 'oldPrice') ?? 0),
          newPrice: Number(field(value, 'newPrice') ?? 0),
          oldDiscountedPrice: field<number | null>(value, 'oldDiscountedPrice'),
          newDiscountedPrice: field<number | null>(value, 'newDiscountedPrice'),
          // The pricing API DTO calls this field ChangedAt; accept the older
          // ChangeDate shape as well so saved history remains compatible.
          changeDate: String(field(value, 'changedAt', 'changeDate') ?? ''),
        })).filter((item: History) => Number.isFinite(new Date(item.changeDate).getTime()));
        setHistory(rows);
      })
      .catch(error => { if (active) { setHistory([]); setHistoryError(error instanceof Error ? error.message : 'دریافت سوابق قیمت ناموفق بود.'); } })
      .finally(() => { if (active) setLoadingHistory(false); });
    return () => { active = false; };
  }, [selected]);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('fa-IR');
    return products.filter(product => !needle || `${product.productName} ${product.productCode ?? ''}`.toLocaleLowerCase('fa-IR').includes(needle));
  }, [products, query]);

  const yearHistory = useMemo(() => {
    const cutoff = new Date(); cutoff.setFullYear(cutoff.getFullYear() - 1);
    return history.filter(item => new Date(item.changeDate) >= cutoff).sort((a, b) => new Date(a.changeDate).getTime() - new Date(b.changeDate).getTime());
  }, [history]);

  const chart = useMemo(() => {
    if (!yearHistory.length) return null;
    const values = yearHistory.flatMap(item => [item.oldPrice, item.newPrice]).filter(Number.isFinite);
    let min = Math.min(...values); let max = Math.max(...values);
    if (min === max) { const margin = Math.max(1, Math.abs(max) * .08); min -= margin; max += margin; }
    const left = 72, right = 872, top = 26, bottom = 236;
    const span = max - min;
    const windowEnd = new Date();
    const windowStart = new Date(windowEnd); windowStart.setFullYear(windowStart.getFullYear() - 1);
    const firstTime = windowStart.getTime();
    const lastTime = windowEnd.getTime();
    const timeSpan = Math.max(1, lastTime - firstTime);
    const y = (value: number) => bottom - ((value - min) / span) * (bottom - top);
    const x = (time: number) => left + ((time - firstTime) / timeSpan) * (right - left);
    const points = [{ x: left, y: y(yearHistory[0].oldPrice), date: new Date(yearHistory[0].changeDate), price: yearHistory[0].oldPrice }, ...yearHistory.map(item => ({ x: x(new Date(item.changeDate).getTime()), y: y(item.newPrice), date: new Date(item.changeDate), price: item.newPrice }))];
    return { min, max, left, right, top, bottom, points, path: points.map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' '), y, windowStart, windowEnd };
  }, [yearHistory]);

  const latestPrice = yearHistory.at(-1)?.newPrice ?? selected?.basePrice ?? 0;
  const firstPrice = yearHistory[0]?.oldPrice ?? latestPrice;
  const changePercent = firstPrice ? ((latestPrice - firstPrice) / firstPrice) * 100 : 0;

  return <main className={styles.page} dir="rtl">
    <header className={styles.header}><div><span><Activity size={15}/> پایش تغییرات</span><h1>تاریخچهٔ قیمت محصولات</h1><p>محصول را انتخاب کنید تا تغییرات قیمت ثبت‌شدهٔ یک سال اخیر را ببینید.</p></div><div className={styles.range}><CalendarDays size={16}/>۱۲ ماه گذشته</div></header>
    <div className={styles.workspace}>
      <section className={styles.productPanel} aria-label="فهرست محصولات">
        <div className={styles.listHeader}><div><h2>محصولات</h2><span>صفحهٔ {page.toLocaleString('fa-IR')} از {pageCount.toLocaleString('fa-IR')}</span></div><label className={styles.search}><Search size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="جست‌وجوی نام یا کد"/></label></div>
        {productsError ? <div className={styles.error}>{productsError}</div> : loadingProducts ? <div className={styles.empty}>در حال دریافت محصولات…</div> : filteredProducts.length ? <div className={styles.productList}>{filteredProducts.map(product => <button key={product.productId} type="button" className={`${styles.product} ${selected?.productId === product.productId ? styles.selected : ''}`} onClick={() => setSelected(product)} aria-pressed={selected?.productId === product.productId}>
          {imageSrc(product.imageUrl) ? <img src={imageSrc(product.imageUrl)} alt="" loading="lazy"/> : <span className={styles.imagePlaceholder}><CircleDollarSign size={20}/></span>}
          <span className={styles.productCopy}><b>{product.productName}</b><small>کد: {product.productCode || 'ثبت نشده'}</small><small>قیمت فعلی: {money(product.basePrice ?? 0)}</small></span><ChevronLeft size={17}/>
        </button>)}</div> : <div className={styles.empty}>محصولی با این نام یا کد در این صفحه نیست.</div>}
        <div className={styles.pager}><button type="button" onClick={() => setPage(value => Math.max(1, value - 1))} disabled={page <= 1 || loadingProducts}>قبلی</button><button type="button" onClick={() => setPage(value => Math.min(pageCount, value + 1))} disabled={page >= pageCount || loadingProducts}>بعدی</button></div>
      </section>

      <section className={styles.detailPanel} aria-live="polite">
        {selected ? <>
          <header className={styles.detailHeader}>
            {imageSrc(selected.imageUrl) ? <img src={imageSrc(selected.imageUrl)} alt=""/> : <span className={styles.detailImagePlaceholder}><CircleDollarSign size={24}/></span>}
            <div><span>محصول انتخاب‌شده</span><h2>{selected.productName}</h2><small>کد محصول: {selected.productCode || 'ثبت نشده'}</small></div>
          </header>
          <div className={styles.stats}><article><span>قیمت فعلی</span><b>{money(selected.basePrice ?? latestPrice)}</b></article><article><span>قیمت پایان سوابق</span><b>{money(latestPrice)}</b></article><article><span>تغییر یک‌ساله</span><b className={changePercent > 0 ? styles.increase : changePercent < 0 ? styles.decrease : ''}>{yearHistory.length ? `${changePercent > 0 ? '+' : ''}${changePercent.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪` : '—'}</b></article></div>
          <div className={styles.chartHeading}><div><h3>روند قیمت</h3><span>{yearHistory.length.toLocaleString('fa-IR')} تغییر ثبت‌شده در ۱۲ ماه گذشته</span></div>{yearHistory.length > 0 && <span className={styles.latest}>{money(latestPrice)}</span>}</div>
          {loadingHistory ? <div className={styles.empty}>در حال بارگذاری سوابق قیمت…</div> : historyError ? <div className={styles.error}>{historyError}</div> : chart ? <div className={styles.chartWrap}>
            <svg className={styles.chart} viewBox="0 0 900 290" role="img" aria-label={`نمودار تغییرات یک‌سالهٔ قیمت ${selected.productName}`}>
              <defs><linearGradient id="price-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#a98bc8" stopOpacity=".24"/><stop offset="100%" stopColor="#a98bc8" stopOpacity=".015"/></linearGradient></defs>
              {[0, 1, 2, 3].map(index => { const value = chart.max - ((chart.max - chart.min) * index) / 3; const y = chart.top + ((chart.bottom - chart.top) * index) / 3; return <g key={index}><line x1={chart.left} x2={chart.right} y1={y} y2={y} className={styles.grid}/><text x={chart.left - 10} y={y + 4} textAnchor="end" className={styles.axis}>{value.toLocaleString('fa-IR', { notation: 'compact', maximumFractionDigits: 1 })}</text></g>; })}
              <path d={`${chart.path} L ${chart.right} ${chart.bottom} L ${chart.left} ${chart.bottom} Z`} fill="url(#price-area)"/>
              <path d={chart.path} className={styles.line}/>
              {chart.points.map((point, index) => <circle key={`${point.date.toISOString()}-${index}`} cx={point.x} cy={point.y} r={index === chart.points.length - 1 ? 5 : 3.5} className={styles.dot}><title>{`${dateLabel(point.date)} · ${money(point.price)}`}</title></circle>)}
              <text x={chart.left} y="270" textAnchor="start" className={styles.axis}>{dateLabel(chart.windowStart, { month: 'short', year: 'numeric' })}</text><text x={chart.right} y="270" textAnchor="end" className={styles.axis}>{dateLabel(chart.windowEnd, { month: 'short', year: 'numeric' })}</text>
            </svg>
            <div className={styles.chartLegend}><i/>قیمت پایهٔ ثبت‌شده در ریال <span>برای جزئیات هر نقطه، نشانگر را لمس کنید.</span></div>
          </div> : <div className={styles.empty}>برای این محصول در یک سال گذشته تغییری در تاریخچه ثبت نشده است.</div>}
          {history.length > yearHistory.length && <p className={styles.note}>این محصول {history.length.toLocaleString('fa-IR')} تغییر قدیمی‌تر از یک سال هم دارد؛ نمودار فقط بازهٔ ۱۲ ماه اخیر را نشان می‌دهد.</p>}
        </> : <div className={styles.empty}>برای دیدن نمودار، یک محصول را از فهرست انتخاب کنید.</div>}
      </section>
    </div>
  </main>;
}
