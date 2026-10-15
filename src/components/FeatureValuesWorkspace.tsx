'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { api, unwrapList } from '@/lib/api';
import { ProductFeaturesEditor } from './ProductFeaturesEditor';
import { useToast } from './Toast';

type ProductHit = { productId: number; productName: string; productCode: string };

export function FeatureValuesWorkspace() {
  const { show } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductHit[]>([]);
  const [selected, setSelected] = useState<ProductHit | null>(null);
  const [loading, setLoading] = useState(false);
  const search = async () => {
    const keyword = query.trim();
    if (!keyword) return;
    setLoading(true);
    try {
      if (/^\d+$/.test(keyword)) {
        const result = await api(`api/Product/${keyword}`);
        const product = result?.data ?? result?.Data;
        if (product?.productId) { setResults([product]); setSelected(product); return; }
      }
      const found = unwrapList(await api('api/Product/search', { query: { keyword, page: 1, pageSize: 20 } }));
      setResults(found);
      setSelected(found.length === 1 ? found[0] : null);
    } catch (cause) { setResults([]); setSelected(null); show(cause instanceof Error ? cause.message : 'جست‌وجوی محصول ناموفق بود.', 'error'); }
    finally { setLoading(false); }
  };

  return <div className="feature-workspace"><div className="page-head"><div><div className="eyebrow">کاتالوگ</div><h1>مقادیر ویژگی محصولات</h1><p>محصول را با نام، کد یا شناسه پیدا کنید و ویژگی‌های آن را ثبت یا ویرایش کنید.</p></div></div>
    <div className="card feature-search-card"><div className="searchbox"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void search(); }} placeholder="نام، کد یا شناسه محصول" aria-label="جست‌وجوی محصول" /></div><button type="button" className="primary" onClick={() => void search()} disabled={loading || !query.trim()}>{loading ? 'در حال جست‌وجو...' : 'جست‌وجو'}</button></div>
    {results.length > 0 && <div className="card feature-search-results">{results.map((product) => <button key={product.productId} type="button" className={selected?.productId === product.productId ? 'selected' : ''} onClick={() => setSelected(product)}><strong>{product.productName}</strong><span>{product.productCode} · #{product.productId}</span></button>)}</div>}
    {!selected && <div className="card feature-empty-state"><strong>{results.length ? 'یک محصول را انتخاب کنید' : 'برای ثبت مقدار، اول محصول را پیدا کنید'}</strong><p>نام، کد یا شناسه محصول را جست‌وجو کنید. بعد از انتخاب محصول، فقط ویژگی‌های متصل به دسته همان محصول نمایش داده می‌شود و می‌توانید مقدارشان را ثبت، ویرایش یا حذف کنید.</p></div>}
    {selected && <div className="card feature-selected"><h2>{selected.productName}</h2><p>کد محصول: {selected.productCode} · شناسه: {selected.productId}</p><ProductFeaturesEditor key={selected.productId} productId={selected.productId} /></div>}
  </div>;
}
// Test
