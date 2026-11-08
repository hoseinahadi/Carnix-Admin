'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CarFront, CheckCircle2, Globe2, RefreshCw, Search, XCircle } from 'lucide-react';
import { API_BASE, api, unwrapList } from '@/lib/api';
import { useToast } from './Toast';

type Row = Record<string, unknown>;
const read = (row: Row, ...keys: string[]) => {
  for (const key of keys) {
    const actual = Object.keys(row).find(name => name.toLowerCase() === key.toLowerCase());
    if (actual && row[actual] !== undefined) return row[actual];
  }
  return undefined;
};
const id = (row: Row, ...keys: string[]) => Number(read(row, ...keys) || 0);
const imageUrl = (value: unknown) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return /^(https?:|data:|blob:)/i.test(raw) ? raw : `${API_BASE}/${raw.replace(/^\/+/, '')}`;
};

export function VehicleCatalogWorkspace() {
  const { show } = useToast();
  const [makes, setMakes] = useState<Row[]>([]);
  const [models, setModels] = useState<Row[]>([]);
  const [selectedMakeId, setSelectedMakeId] = useState(0);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [makeResponse, modelResponse] = await Promise.all([
        api('api/vehicles/makes'),
        api('api/vehicles/models'),
      ]);
      setMakes(unwrapList(makeResponse));
      setModels(unwrapList(modelResponse));
    } catch (cause: any) {
      show(cause.message || 'دریافت اطلاعات خودروها انجام نشد.', 'error');
    } finally { setLoading(false); }
  }, [show]);

  useEffect(() => { void load(); }, [load]);

  const term = query.trim().toLocaleLowerCase('fa-IR');
  const modelCount = (makeId: number) => models.filter(model => id(model, 'vehicleMakeId') === makeId).length;
  const visibleMakes = useMemo(() => makes.filter(make => {
    if (!term) return true;
    return `${read(make, 'name') ?? ''} ${read(make, 'englishName') ?? ''} ${read(make, 'country') ?? ''}`.toLocaleLowerCase('fa-IR').includes(term)
      || models.some(model => id(model, 'vehicleMakeId') === id(make, 'vehicleMakeId') && `${read(model, 'name') ?? ''} ${read(model, 'bodyType') ?? ''}`.toLocaleLowerCase('fa-IR').includes(term));
  }), [makes, models, term]);
  const visibleModels = useMemo(() => models.filter(model => {
    if (selectedMakeId && id(model, 'vehicleMakeId') !== selectedMakeId) return false;
    if (!term) return true;
    return `${read(model, 'name') ?? ''} ${read(model, 'makeName') ?? ''} ${read(model, 'bodyType') ?? ''} ${read(model, 'description') ?? ''}`.toLocaleLowerCase('fa-IR').includes(term);
  }), [models, selectedMakeId, term]);
  const selectedMake = makes.find(make => id(make, 'vehicleMakeId') === selectedMakeId);

  return <>
    <div className="page-head vehicle-page-head"><div><div className="eyebrow">کاتالوگ خودرو</div><h1>خودروسازها و مدل‌ها</h1><p>برند و مدل خودرو را کنار هم ببینید؛ انتخاب هر خودروساز، مدل‌های مربوط به همان برند را بدون خروج از صفحه فیلتر می‌کند.</p></div><button type="button" className="ghost" disabled={loading} onClick={() => void load()}><RefreshCw size={16}/>{loading ? 'در حال دریافت…' : 'به‌روزرسانی'}</button></div>
    <div className="vehicle-summary"><article><Globe2/><span><small>خودروساز ثبت‌شده</small><b>{makes.length.toLocaleString('fa-IR')}</b></span></article><article><CarFront/><span><small>مدل و نسل ثبت‌شده</small><b>{models.length.toLocaleString('fa-IR')}</b></span></article><article><CheckCircle2/><span><small>مدل فعال</small><b>{models.filter(model => read(model, 'isActive') !== false).length.toLocaleString('fa-IR')}</b></span></article></div>
    <div className="vehicle-search card"><div className="searchbox"><Search size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="جست‌وجوی برند، مدل یا نوع بدنه…" aria-label="جست‌وجوی خودرو"/></div>{selectedMake && <button type="button" onClick={() => setSelectedMakeId(0)}>حذف فیلتر «{String(read(selectedMake, 'name'))}» ×</button>}</div>
    {loading ? <div className="loading card"><i/><span>در حال دریافت کاتالوگ خودرو…</span></div> : <div className="vehicle-workspace">
      <aside className="card vehicle-makes"><header><div><b>خودروسازها</b><small>برای دیدن مدل‌ها انتخاب کنید</small></div><strong>{visibleMakes.length.toLocaleString('fa-IR')}</strong></header><button type="button" className={!selectedMakeId ? 'active' : ''} onClick={() => setSelectedMakeId(0)}><span className="vehicle-make-logo"><CarFront/></span><span><b>همه خودروها</b><small>{models.length.toLocaleString('fa-IR')} مدل</small></span></button>{visibleMakes.map((make, index) => { const makeId = id(make, 'vehicleMakeId'); const logo = imageUrl(read(make, 'logoUrl')); return <button type="button" className={selectedMakeId === makeId ? 'active' : ''} onClick={() => setSelectedMakeId(makeId)} key={makeId || index}><span className="vehicle-make-logo">{logo ? <img src={logo} alt="" onError={event => { event.currentTarget.style.display = 'none'; }}/>:<CarFront/>}</span><span><b>{String(read(make, 'name') || `خودروساز ${index + 1}`)}</b><small>{String(read(make, 'englishName') || read(make, 'country') || '—')} · {modelCount(makeId).toLocaleString('fa-IR')} مدل</small></span>{read(make, 'isActive') === false && <XCircle className="vehicle-inactive"/>}</button>; })}{!visibleMakes.length && <div className="empty small">خودروسازی پیدا نشد.</div>}</aside>
      <section className="card vehicle-models"><header><div><b>{selectedMake ? `مدل‌های ${String(read(selectedMake, 'name'))}` : 'همه مدل‌ها'}</b><small>اطلاعات مرجع سازگاری محصولات</small></div><strong>{visibleModels.length.toLocaleString('fa-IR')}</strong></header><div className="vehicle-model-grid">{visibleModels.map((model, index) => { const photo = imageUrl(read(model, 'imageUrl')); const yearStart = read(model, 'yearStart'); const yearEnd = read(model, 'yearEnd'); return <article key={String(read(model, 'vehicleGenerationId', 'modelId') ?? index)}><div className="vehicle-model-image">{photo ? <img loading="lazy" src={photo} alt={String(read(model, 'name') || 'خودرو')} onError={event => { event.currentTarget.style.display = 'none'; }}/>:<CarFront/>}</div><div><div className="vehicle-model-title"><b>{String(read(model, 'name') || `مدل ${index + 1}`)}</b><span className={`badge ${read(model, 'isActive') === false ? 'muted' : 'ok'}`}>{read(model, 'isActive') === false ? 'غیرفعال' : 'فعال'}</span></div><small>{String(read(model, 'makeName') || read(makes.find(make => id(make, 'vehicleMakeId') === id(model, 'vehicleMakeId')) || {}, 'name') || 'برند نامشخص')}</small><div className="vehicle-model-meta">{read(model, 'bodyType') && <span>{String(read(model, 'bodyType'))}</span>}{(yearStart || yearEnd) && <span>{String(yearStart || '—')} تا {String(yearEnd || 'اکنون')}</span>}<span>شناسه {String(read(model, 'modelId') || '—')}</span></div></div></article>; })}{!visibleModels.length && <div className="empty small">مدلی با فیلتر فعلی پیدا نشد.</div>}</div></section>
    </div>}
  </>;
}
