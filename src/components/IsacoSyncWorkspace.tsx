'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, AlertTriangle, ArrowDownToLine, Check, CircleDollarSign, Image as ImageIcon, LoaderCircle, PackageSearch, RefreshCw, Search, ShieldCheck, Upload, X } from 'lucide-react';
import { api, tokenStore, unwrapData, unwrapList } from '@/lib/api';
import { useAuth } from './AuthProvider';
import { makeIsacoReport, normalizeName, parseIsacoSnapshot, priceOptionKey, type IsacoItem, type IsacoPriceField, type IsacoPriceOption, type IsacoRow, type StoreProduct } from '@/features/isaco/isacoSync';
import styles from './IsacoSyncWorkspace.module.scss';

const priceOptions: { value: IsacoPriceField; label: string }[] = [
  { value: 'salePrice', label: 'فی فروش' },
  { value: 'consumerPrice', label: 'قیمت مصرف‌کننده' },
  { value: 'vatPrice', label: 'قیمت با ارزش افزوده' },
];

async function fetchIsacoLocal(input: RequestInfo | URL, init: RequestInit = {}) {
  const send = (token: string) => {
    const headers = new Headers(init.headers);
    headers.set('Authorization', `ApiToken ${token}`);
    return fetch(input, { ...init, headers });
  };
  let token = tokenStore.get();
  if (!token) throw new Error('نشست پنل معتبر نیست؛ یک‌بار خارج شوید و دوباره وارد پنل شوید.');
  let response = await send(token);
  if (response.status === 401) {
    try { await api('api/Auth/me'); }
    catch { throw new Error('نشست پنل منقضی شده است؛ دوباره وارد پنل شوید و سپس کرولر را اجرا کنید.'); }
    token = tokenStore.get();
    if (!token) throw new Error('نشست پنل تمدید نشد؛ دوباره وارد پنل شوید.');
    response = await send(token);
  }
  return response;
}

type StoreVehicleModel = { modelId: number; makeId: number; makeName: string; modelName: string; isActive: boolean };
type MetadataReview = { productId: number; vehicles: { source: string; matches: string[] }[]; replacements: { code: string; matches: string[] }[]; images: { file: string; available: boolean }[] };
type UnmatchedProduct = { storeProductKey?: string; code: string; name: string; codeSearch?: string; nameSearch?: string; reason?: string };
type FailedProduct = { storeProductKey?: string; code: string; name: string; worker?: string; reason?: string };
type CrawlerStatus = { mode?: 'Prices' | 'Epc' | null; state: 'idle' | 'queued' | 'running' | 'cancelling' | 'cancelled' | 'succeeded' | 'failed' | 'stale'; workers?: number; availableModes?: ('Prices' | 'Epc')[]; startedAt?: string; updatedAt?: string; logFile?: string; outputFile?: string; error?: string; message?: string; phase?: string; priceSync?: { updated?: number; matchedByCode?: number; matchedByName?: number; unmatched?: number; ambiguous?: number; failed?: number; skipped?: boolean; reason?: string }; progress?: { completed?: number; total?: number; failed?: number; completedNodes?: number; pendingBranches?: number; current?: string } };
type LocalCategory = { id: number; name: string; parentId: number | null; path: string[] };
const CATEGORY_MAPPING_KEY = 'isaco-category-mappings-v1';
const REVIEW_PAGE_SIZE = 50;

function normalizeLookupCode(value: string) {
  return value.normalize('NFKC').replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[\s\u200c-]/g, '').toLocaleUpperCase('en-US');
}

function stripCatalogNumber(value: string) {
  return value.trim().replace(/^\s*\d+\s*[-–—]\s*/, '').trim();
}

function hasCatalogMetadata(item: IsacoItem | null) {
  return !!item && !!(
    item.categoryPath?.length || item.compatibleVehicles?.length || item.replacementCodes?.length || item.alternativeCodes?.length || item.imageFiles?.length
  );
}

function hasImportableMetadata(item: IsacoItem | null) {
  return !!item && !!(item.compatibleVehicles?.length || item.replacementCodes?.length || item.alternativeCodes?.length || item.imageFiles?.length);
}

function formatPrice(value?: number | null) {
  return typeof value === 'number' ? `${value.toLocaleString('fa-IR')} ریال` : '—';
}

function localProductKey(product: StoreProduct) {
  return normalizeLookupCode(product.productCode ?? '') || `name:${normalizeName(product.productName)}`;
}

export function IsacoSyncWorkspace() {
  const { logout } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const storeProductsCache = useRef<StoreProduct[] | null>(null);
  const pendingPricePreview = useRef(false);
  const pendingEpcPreview = useRef(false);
  const lastPricePreviewCount = useRef(0);
  const pricePreviewLoading = useRef(false);
  const lastTerminalPricePreview = useRef('');
  const assetsRef = useRef<HTMLInputElement>(null);
  const [assetFiles, setAssetFiles] = useState<Map<string, File>>(new Map());
  const [serverAssetNames, setServerAssetNames] = useState<Set<string>>(new Set());
  const [assetFolderName, setAssetFolderName] = useState('');
  const [items, setItems] = useState<IsacoItem[]>([]);
  const [sourceCategories, setSourceCategories] = useState<{ path: string[]; imageFile?: string }[]>([]);
  const [categoryPreview, setCategoryPreview] = useState<{ path: string[]; category: any | null; status: string }[]>([]);
  const [localCategories, setLocalCategories] = useState<LocalCategory[]>([]);
  const [categoryMappings, setCategoryMappings] = useState<Record<string, number>>({});
  const [selectedCategoryPaths, setSelectedCategoryPaths] = useState<string[]>([]);
  const [collectorUnmatched, setCollectorUnmatched] = useState<string[]>([]);
  const [collectorUnmatchedProducts, setCollectorUnmatchedProducts] = useState<UnmatchedProduct[]>([]);
  const [collectorFailedProducts, setCollectorFailedProducts] = useState<FailedProduct[]>([]);
  const [collectorPartial, setCollectorPartial] = useState(false);
  const [filename, setFilename] = useState('');
  const [priceField, setPriceField] = useState<IsacoPriceField>('salePrice');
  const [rows, setRows] = useState<IsacoRow[] | null>(null);
  const [metadataReview, setMetadataReview] = useState<MetadataReview[]>([]);
  const [crawlerStatus, setCrawlerStatus] = useState<CrawlerStatus>({ state: 'idle', availableModes: ['Prices', 'Epc'] });
  const [priceWorkers, setPriceWorkers] = useState(5);
  const [selected, setSelected] = useState<number[]>([]);
  const [filter, setFilter] = useState<'all' | 'found' | 'multiple' | 'unmatched' | 'ambiguous' | 'ready' | 'errors' | 'missing-isaco' | 'needs-choice'>('all');
  const [selectedIsacoCodes, setSelectedIsacoCodes] = useState<number[]>([]);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [autoPriceApplied, setAutoPriceApplied] = useState(false);
  const [authInvalid, setAuthInvalid] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function findCategoryForPath(sourcePath?: string[]) {
    if (!sourcePath?.length) return null;
    return categoryPreview.find(entry => entry.path.length === sourcePath.length && entry.path.every((part, index) => normalizeName(part) === normalizeName(sourcePath[index] ?? ''))) ?? null;
  }

  function resolveProductCategory(item: IsacoItem | null) {
    if (!item) return null;
    const sourcePaths = item.categoryPaths?.length ? item.categoryPaths : item.categoryPath?.length ? [item.categoryPath] : [];
    const uniquePaths = [...new Map(sourcePaths.map(path => [path.map(normalizeName).join('/'), path])).values()];
    if (!uniquePaths.length) return null;
    const destinations = uniquePaths.map(path => findCategoryForPath(path)?.category ?? null);
    const destinationIds = new Set(destinations.filter(Boolean).map(category => Number(category.id)));
    if (destinations.some(destination => !destination) || destinationIds.size !== 1) return null;
    return destinations.find(Boolean) ?? null;
  }

  async function fetchCrawlerStatus() {
    if (authInvalid) return;
    const token = tokenStore.get();
    if (!token) { setAuthInvalid(true); setError('نشست پنل موجود نیست؛ دوباره وارد پنل شوید.'); return; }
    try {
      const response = await fetchIsacoLocal('/api/isaco/jobs', { headers: { Accept: 'application/json' }, cache: 'no-store' });
      const data = await response.json();
      if (response.ok) {
        const status = data as CrawlerStatus;
        if (!Array.isArray(status.availableModes)) status.availableModes = ['Prices', 'Epc'];
        setCrawlerStatus(status);
        setError(current => /نشست|دسترسی معتبر|برای شروع کرولر|سرویس کرولر/.test(current) ? '' : current);
        if (status.mode === 'Prices' && ['queued', 'running', 'cancelling'].includes(status.state)) pendingPricePreview.current = true;
        if (status.mode === 'Prices' && ['succeeded', 'failed', 'stale', 'cancelled'].includes(status.state)) {
          const terminalKey = `${status.startedAt ?? status.updatedAt ?? ''}:${status.state}`;
          if (lastTerminalPricePreview.current !== terminalKey) {
            lastTerminalPricePreview.current = terminalKey;
            pendingPricePreview.current = true;
          }
        }
        if (status.mode === 'Epc' && (status.state === 'queued' || status.state === 'running')) pendingEpcPreview.current = true;
        if (pendingPricePreview.current && status.mode === 'Prices' && ['queued', 'running', 'cancelling'].includes(status.state)) {
          const completed = Number(status.progress?.completed ?? 0);
          if (completed > lastPricePreviewCount.current && !pricePreviewLoading.current) {
            pricePreviewLoading.current = true;
            lastPricePreviewCount.current = completed;
            try { await loadLatestFromServer('Prices', true); }
            finally { pricePreviewLoading.current = false; }
          }
        }
        if (pendingPricePreview.current && status.mode === 'Prices' && status.state === 'succeeded') {
          pendingPricePreview.current = false;
          lastPricePreviewCount.current = 0;
          await loadLatestFromServer('Prices', true);
          const sync = status.priceSync;
          setAutoPriceApplied(!sync?.skipped && Number(sync?.failed ?? 0) === 0);
          setMessage(sync?.skipped
            ? 'دریافت قیمت تمام شد؛ این اجرا به‌روزرسانی خودکار دیتابیس نداشت. خروجی برای بازبینی بارگذاری شد.'
            : `کار تمام شد: ${Number(sync?.updated ?? 0).toLocaleString('fa-IR')} قیمت خودکار ثبت شد؛ ${Number(sync?.unmatched ?? 0).toLocaleString('fa-IR')} بی‌نتیجه، ${Number(sync?.ambiguous ?? 0).toLocaleString('fa-IR')} مبهم و ${Number(sync?.failed ?? 0).toLocaleString('fa-IR')} ناموفق. جزئیات برای بازبینی بارگذاری شد.`);
        } else if (pendingPricePreview.current && status.mode === 'Prices' && (status.state === 'failed' || status.state === 'stale' || status.state === 'cancelled')) {
          pendingPricePreview.current = false;
          lastPricePreviewCount.current = 0;
          await loadLatestFromServer('Prices', true);
          setMessage('اجرا متوقف شد؛ نتیجه‌های ذخیره‌شده تا لحظهٔ توقف برای بازبینی بارگذاری شدند. موارد دلخواه را تیک بزنید.');
          if (status.error) setError(status.error);
        }
        if (pendingEpcPreview.current && status.mode === 'Epc' && status.state === 'succeeded') {
          pendingEpcPreview.current = false;
          setMessage('پیمایش EPC تمام شد؛ دسته‌ها، قطعات و اطلاعات سازگاری برای بازبینی بارگذاری می‌شوند.');
          await loadLatestFromServer('Epc');
        } else if (pendingEpcPreview.current && status.mode === 'Epc' && (status.state === 'failed' || status.state === 'stale' || status.state === 'cancelled')) {
          pendingEpcPreview.current = false;
        }
      } else {
        if (response.status === 401 || response.status === 403) setAuthInvalid(true);
        setError(data?.message || 'وضعیت کرولر خوانده نشد؛ هنگام شروع، علت دقیق نمایش داده می‌شود.');
      }
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : 'ارتباط با سرویس کرولر برقرار نشد.';
      if (/نشست|وارد پنل|دسترسی/.test(detail)) setAuthInvalid(true);
      setError(detail);
    }
  }

  async function startCrawler(mode: 'Prices' | 'Epc', resetCheckpoint = false) {
    if (resetCheckpoint && !window.confirm('checkpoint و ادامهٔ اجرای قبلی از چرخهٔ فعال خارج می‌شود؛ یک نسخهٔ آرشیوی نگه می‌داریم و قیمت‌گیری از ابتدا شروع می‌شود. ادامه می‌دهید؟')) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await fetchIsacoLocal('/api/isaco/jobs', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ mode, workers: mode === 'Prices' ? priceWorkers : 1, ...(resetCheckpoint ? { resetCheckpoint: true } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'شروع کرولر ناموفق بود.');
      setAuthInvalid(false);
      if (resetCheckpoint) {
        setItems([]); setRows(null); setSelected([]); setSelectedIsacoCodes([]); setCollectorUnmatched([]); setCollectorUnmatchedProducts([]); setCollectorFailedProducts([]); setCollectorPartial(false);
      }
      if (mode === 'Prices') pendingPricePreview.current = true;
      if (mode === 'Prices') { lastPricePreviewCount.current = 0; pricePreviewLoading.current = false; lastTerminalPricePreview.current = ''; }
      if (mode === 'Epc') pendingEpcPreview.current = true;
      setMessage(mode === 'Prices' ? resetCheckpoint ? `قیمت‌گیری از ابتدا با ${priceWorkers.toLocaleString('fa-IR')} تب شروع شد؛ checkpoint قبلی آرشیو شد.` : `جمع‌آوری قیمت با ${priceWorkers.toLocaleString('fa-IR')} تب شروع شد و از checkpoint ادامه می‌دهد؛ خروجی برای بازبینی بارگذاری می‌شود.` : 'پیمایش دسته‌ها و کاتالوگ شروع شد.');
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : 'شروع کرولر ناموفق بود.';
      if (/نشست|وارد پنل|دسترسی/.test(detail)) setAuthInvalid(true);
      setError(detail);
    }
    finally { setBusy(false); }
  }

  async function cancelCrawler() {
    if (!window.confirm('اجرای جاری لغو شود؟ پیشرفت ثبت‌شده و checkpoint حفظ می‌شود.')) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await fetchIsacoLocal('/api/isaco/jobs', { method: 'DELETE', headers: { Accept: 'application/json' } });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'لغو کرولر ناموفق بود.');
      setCrawlerStatus(current => ({ ...current, state: 'cancelling', message: data?.message }));
      setMessage(data?.message || 'درخواست لغو ثبت شد؛ checkpoint حفظ می‌شود.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'لغو کرولر ناموفق بود.');
    } finally { setBusy(false); }
  }

  useEffect(() => {
    void fetchCrawlerStatus();
    const timer = window.setInterval(() => void fetchCrawlerStatus(), 8_000);
    return () => window.clearInterval(timer);
  }, [authInvalid]);

  async function importFile(file?: File, preserveSelection = false): Promise<IsacoItem[] | null> {
    if (!file) return null;
    setAutoPriceApplied(false);
    setBusy(true); setError(''); setMessage('');
    if (!preserveSelection) { setRows(null); setSelected([]); }
    try {
      const snapshot = JSON.parse(await file.text()) as { unmatchedCodes?: unknown; unmatchedProducts?: unknown; failedProducts?: unknown; categories?: unknown; partial?: unknown; complete?: unknown };
      setCollectorPartial(snapshot.partial === true || snapshot.complete === false);
      const parsed = parseIsacoSnapshot(snapshot);
      setItems(parsed);
      setSourceCategories(Array.isArray(snapshot.categories) ? snapshot.categories.filter((category): category is { path: string[]; imageFile?: string } => !!category && typeof category === 'object' && Array.isArray((category as { path?: unknown }).path) && (category as { path: unknown[] }).path.every(part => typeof part === 'string')) : []);
      const sourceCats = Array.isArray(snapshot.categories) ? snapshot.categories.filter((category: any) => category && Array.isArray(category.path) && category.path.every((part: unknown) => typeof part === 'string')) : [];
      if (sourceCats.length) {
        const response = await api<any>('api/Category/options');
        const rawCats = unwrapList(response).map((category: any) => ({
          id: Number(category.categoryId ?? category.CategoryId), name: String(category.name ?? category.Name ?? ''),
          parentId: Number(category.parentCategoryId ?? category.ParentCategoryId) || null,
        }));
        const byId = new Map(rawCats.map((category: any) => [category.id, category]));
        const pathFor = (category: any, seen = new Set<number>()): string[] => {
          if (!category || seen.has(category.id)) return [];
          seen.add(category.id);
          const parent = category.parentId ? byId.get(category.parentId) : null;
          return [...(parent ? pathFor(parent, seen) : []), category.name];
        };
        const localCats: LocalCategory[] = rawCats.map((category: any) => ({ ...category, path: pathFor(category) }));
        setLocalCategories(localCats);
        const savedMappings = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(CATEGORY_MAPPING_KEY) || '{}') as Record<string, number> : {};
        setCategoryMappings(savedMappings);
        setCategoryPreview(sourceCats.map((source: any) => {
          const pathKey = source.path.join(' / ');
          const savedId = Number(savedMappings[pathKey]);
          const savedCategory = savedId ? localCats.find(category => category.id === savedId) : undefined;
          if (savedCategory) return { path: source.path, category: savedCategory, status: 'نگاشت دستی ذخیره‌شده' };
          const normalizedPath = source.path.map((part: string) => normalizeName(part));
          const matches = localCats.filter((category: any) => {
            const localPath = pathFor(category).map(normalizeName);
            return localPath.length === normalizedPath.length && localPath.every((part: string, index: number) => part === normalizedPath[index]);
          });
          return { path: source.path, category: matches.length === 1 ? matches[0] : null, status: matches.length === 1 ? 'تطبیق دقیق مسیر' : matches.length ? 'تطبیق مبهم' : 'مسیر دسته پیدا نشد' };
        }));
        setSelectedCategoryPaths([]);
      } else { setCategoryPreview([]); setSelectedCategoryPaths([]); setLocalCategories([]); }
      setCollectorUnmatched(Array.isArray(snapshot?.unmatchedCodes) ? snapshot.unmatchedCodes.map(String) : []);
      setCollectorUnmatchedProducts(Array.isArray(snapshot?.unmatchedProducts) ? snapshot.unmatchedProducts.filter((record): record is UnmatchedProduct => !!record && typeof record === 'object').map(record => ({
        storeProductKey: String(record.storeProductKey ?? ''), code: String(record.code ?? ''), name: String(record.name ?? ''),
        codeSearch: String(record.codeSearch ?? ''), nameSearch: String(record.nameSearch ?? ''), reason: String(record.reason ?? ''),
      })) : []);
      setCollectorFailedProducts(Array.isArray(snapshot?.failedProducts) ? snapshot.failedProducts.filter((record): record is FailedProduct => !!record && typeof record === 'object').map(record => ({
        storeProductKey: String(record.storeProductKey ?? ''), code: String(record.code ?? ''), name: String(record.name ?? ''),
        worker: String(record.worker ?? ''), reason: String(record.reason ?? ''),
      })) : []);
      setFilename(file.name);
      setMessage(`${parsed.length.toLocaleString('fa-IR')} نتیجه از فایل خوانده شد.`);
      return parsed;
    } catch (cause) {
      setItems([]); setFilename(''); setCollectorUnmatchedProducts([]); setCollectorFailedProducts([]); setCollectorPartial(false);
      setSourceCategories([]);
      setError(cause instanceof Error ? cause.message : 'خواندن فایل ناموفق بود.');
      return null;
    } finally { setBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function loadLatestFromServer(mode: 'Prices' | 'Epc' = 'Prices', reviewOnly = false) {
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await fetchIsacoLocal(`/api/isaco/latest?mode=${mode}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      const snapshot = await response.json();
      if (!response.ok) throw new Error(snapshot?.message || 'دریافت آخرین خروجی از سرور ناموفق بود.');
      const manifestResponse = await fetchIsacoLocal('/api/isaco/assets?manifest=1', { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        setServerAssetNames(new Set(Array.isArray(manifest.files) ? manifest.files.map(String) : []));
      } else setServerAssetNames(new Set());
      const parsed = await importFile(new File([JSON.stringify(snapshot)], mode === 'Epc' ? 'epc-latest.json' : 'prices-latest.json', { type: 'application/json' }), reviewOnly);
      if (parsed) {
        await buildPreview(parsed, mode === 'Epc');
        if (mode === 'Prices' && reviewOnly) {
          setMessage(`تا این لحظه ${Number(snapshot.completedCount ?? parsed.length).toLocaleString('fa-IR')} کد بررسی شده و ${parsed.length.toLocaleString('fa-IR')} قیمت/محصول پیدا شده؛ برای ثبت، ردیف‌های دلخواه را تیک بزنید.`);
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'دریافت آخرین خروجی از سرور ناموفق بود.');
      setBusy(false);
    }
  }

  async function loadAssetFile(filename: string): Promise<File> {
    const localFile = assetFiles.get(filename);
    if (localFile) return localFile;
    if (!serverAssetNames.has(filename)) throw new Error(`فایل ${filename} در خروجی سرور یا پوشهٔ انتخاب‌شده نیست.`);
    const response = await fetchIsacoLocal(`/api/isaco/assets?name=${encodeURIComponent(filename)}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`دریافت تصویر ${filename} از سرور ناموفق بود.`);
    return new File([await response.blob()], filename, { type: response.headers.get('content-type') || 'application/octet-stream' });
  }

  async function applySelectedCategoryImages() {
    const tasks = sourceCategories.map((source, index) => {
      const preview = categoryPreview[index];
      const imageName = source.imageFile?.split(/[\\/]/).pop() ?? '';
      const file = imageName ? assetFiles.get(imageName) : undefined;
      return preview?.category && selectedCategoryPaths.includes(source.path.join(' / ')) && imageName && (file || serverAssetNames.has(imageName))
        ? { source, category: preview.category, file, imageName } : null;
    }).filter((task): task is { source: { path: string[]; imageFile?: string }; category: any; file: File | undefined; imageName: string } => !!task);
    if (!tasks.length) return;
    if (tasks.length > 200) { setError('در هر نوبت حداکثر ۲۰۰ تصویر دسته را اعمال کنید.'); return; }
    if (!window.confirm(`تصویر ${tasks.length.toLocaleString('fa-IR')} دستهٔ انتخاب‌شده بارگذاری و ثبت شود؟`)) return;
    setBusy(true); setError(''); setMessage('');
    let succeeded = 0; const failures: string[] = []; const succeededPaths = new Set<string>();
    for (const task of tasks) {
      try {
        const detailsResponse = await api<any>(`api/Category/${task.category.id}`);
        const details = unwrapData(detailsResponse);
        const file = task.file ?? await loadAssetFile(task.imageName);
        const formData = new FormData(); formData.append('file', file); formData.append('MediaType', 'Image');
        formData.append('Caption', `Isaco category ${task.imageName}`); formData.append('AltText', task.source.path.join(' / '));
        const uploadResponse = await api<any>('api/product-medias/upload', { method: 'POST', formData });
        const uploaded = unwrapData(uploadResponse); const media = uploaded?.media ?? uploaded?.Media ?? {};
        const imageUrl = String(uploaded?.mediaUrl ?? uploaded?.MediaUrl ?? media.mediaUrl ?? media.MediaUrl ?? '');
        if (!imageUrl) throw new Error('آدرس تصویر بارگذاری‌شده دریافت نشد.');
        await api<any>(`api/Category/${task.category.id}`, { method: 'PUT', body: {
          name: details.name ?? details.Name, slug: details.slug ?? details.Slug ?? null,
          description: details.description ?? details.Description ?? '',
          parentCategoryId: details.parentCategoryId ?? details.ParentCategoryId ?? null,
          displayOrder: details.displayOrder ?? details.DisplayOrder ?? 0,
          isActive: details.isActive ?? details.IsActive ?? true,
          metaTitle: details.metaTitle ?? details.MetaTitle ?? null,
          metaDescription: details.metaDescription ?? details.MetaDescription ?? null,
          imageUrl,
        } });
        succeeded += 1;
        succeededPaths.add(task.source.path.join(' / '));
      } catch (cause) { failures.push(`${task.category.name}: ${cause instanceof Error ? cause.message : 'خطای ثبت'}`); }
    }
    setSelectedCategoryPaths(current => current.filter(path => !succeededPaths.has(path)));
    setMessage(`${succeeded.toLocaleString('fa-IR')} تصویر دسته ثبت شد${failures.length ? `؛ ${failures.length.toLocaleString('fa-IR')} مورد ناموفق بود` : ''}.`);
    if (failures.length) setError(failures.slice(0, 4).join('؛ '));
    setBusy(false);
  }

  function chooseCategoryMapping(index: number, categoryId: number) {
    const source = sourceCategories[index];
    if (!source) return;
    const category = localCategories.find(item => item.id === categoryId) ?? null;
    const key = source.path.join(' / ');
    const next = { ...categoryMappings };
    if (category) next[key] = category.id;
    else delete next[key];
    setCategoryMappings(next);
    try { localStorage.setItem(CATEGORY_MAPPING_KEY, JSON.stringify(next)); } catch { /* The current mapping still works for this review. */ }
    const sourcePath = source.path.join(' / ');
    setSelectedCategoryPaths(current => current.filter(path => path !== sourcePath));
    setCategoryPreview(current => current.map((row, rowIndex) => rowIndex === index
      ? { ...row, category, status: category ? 'نگاشت دستی' : 'نیازمند نگاشت' } : row));
  }

  const categoryMoves = useMemo(() => (rows ?? []).flatMap(row => {
      if (!row.source?.categoryPath?.length) return [];
      const target = resolveProductCategory(row.source);
      const targetId = Number(target?.id);
      const currentId = Number(row.local.categoryId ?? 0);
      if (!targetId || targetId === currentId) return [];
      return [{ productId: row.local.productId, sourcePath: row.source.categoryPath.join(' / '), currentId, currentName: row.local.categoryName || localCategories.find(category => category.id === currentId)?.name || 'بدون دسته', targetId, targetName: String(target.name ?? '') }];
    }), [rows, categoryPreview, localCategories]);
  const selectedCategoryMoveCount = categoryMoves.filter(move => selected.includes(move.productId)).length;

  async function applySelectedCategoryMoves() {
    const moves = categoryMoves.filter(move => selected.includes(move.productId));
    if (!moves.length) return;
    if (moves.length > 5_000) { setError('در هر نوبت حداکثر ۵۰۰۰ جابه‌جایی دسته ثبت کنید.'); return; }
    const grouped = new Map<number, typeof moves>();
    for (const move of moves) grouped.set(move.targetId, [...(grouped.get(move.targetId) ?? []), move]);
    const summary = [...grouped].map(([targetId, items]) => `${items.length} محصول ← ${localCategories.find(category => category.id === targetId)?.path.join(' / ') ?? items[0].targetName}`).join('\n');
    if (!window.confirm(`پس از بازبینی، دستهٔ ${moves.length} محصول تغییر می‌کند:\n${summary}\n\nادامه می‌دهید؟`)) return;
    setBusy(true); setError(''); setMessage('');
    let moved = 0; const failures: string[] = []; const succeededIds = new Set<number>();
    for (const [targetId, targetMoves] of grouped) {
      for (let offset = 0; offset < targetMoves.length; offset += 500) {
        const batch = targetMoves.slice(offset, offset + 500);
        try {
          await api<any>(`api/Product/category/${targetId}/assign-products`, { method: 'POST', body: { productIds: batch.map(item => item.productId) } });
          moved += batch.length;
          batch.forEach(item => succeededIds.add(item.productId));
        } catch (cause) { failures.push(`${batch.length} محصول به ${batch[0]?.targetName}: ${cause instanceof Error ? cause.message : 'خطای سرور'}`); }
      }
    }
    setRows(current => current?.map(row => {
      if (!succeededIds.has(row.local.productId)) return row;
      const move = moves.find(item => item.productId === row.local.productId);
      return move ? { ...row, local: { ...row.local, categoryId: move.targetId, categoryName: move.targetName } } : row;
    }) ?? null);
    setMessage(`${moved.toLocaleString('fa-IR')} محصول به دستهٔ نگاشت‌شده منتقل شد${failures.length ? `؛ ${failures.length.toLocaleString('fa-IR')} مورد ناموفق بود` : ''}.`);
    if (failures.length) setError(failures.slice(0, 3).join('؛ '));
    setBusy(false);
  }

  async function loadStoreProducts(): Promise<StoreProduct[]> {
    if (storeProductsCache.current) return storeProductsCache.current;
    const catalog: StoreProduct[] = [];
    let totalPages = 1;
    for (let page = 1; page <= totalPages && page <= 1000; page += 1) {
      const response = await api<any>('api/Product/filtered', { query: { page, pageSize: 100, includeInactive: true } });
      const data = unwrapData(response);
      const products = unwrapList(data) as StoreProduct[];
      catalog.push(...products);
      const reportedPages = Number(data?.totalPages ?? data?.TotalPages ?? 1) || 1;
      if (reportedPages > 1000) throw new Error(`فهرست فروشگاه ${reportedPages.toLocaleString('fa-IR')} صفحه دارد؛ سقف پیش‌نمایش ۱۰۰۰ صفحه است و اطلاعات ناقص نمایش داده نشد.`);
      totalPages = reportedPages;
      if (!products.length) break;
    }
    // The filtered API can repeat the same product across result pages (for
    // example when related SKU rows are joined). A preview row is one local
    // product, so normalize that list by its stable product ID.
    const uniqueCatalog = [...new Map(catalog.map(product => [Number(product.productId), product] as const).filter(([id]) => Number.isFinite(id) && id > 0)).values()];
    storeProductsCache.current = uniqueCatalog;
    return uniqueCatalog;
  }

  async function buildPreview(sourceItems: IsacoItem[] = items, selectMetadata = false) {
    setBusy(true); setError(''); setMessage('');
    try {
      const catalog = await loadStoreProducts();
      const report = makeIsacoReport(catalog, sourceItems, priceField);
      const metadataRows = report.filter(row => hasCatalogMetadata(row.source));
      let vehicleModels: StoreVehicleModel[] = [];
      if (metadataRows.some(row => row.source?.compatibleVehicles?.length)) {
        const response = await api<any>('api/vehicles/models');
        vehicleModels = unwrapList(response).map((model: any) => ({
          modelId: Number(model.modelId ?? model.ModelId ?? model.vehicleModelId ?? model.VehicleModelId ?? model.vehicleGenerationId ?? model.VehicleGenerationId),
          makeId: Number(model.vehicleMakeId ?? model.VehicleMakeId), makeName: String(model.makeName ?? model.MakeName ?? ''),
          modelName: String(model.name ?? model.Name ?? ''), isActive: (model.isActive ?? model.IsActive) !== false,
        })).filter(model => model.modelId > 0 && model.modelName && model.isActive);
      }
      const productsByCode = new Map<string, StoreProduct[]>();
      for (const product of catalog) {
        const code = normalizeLookupCode(product.productCode ?? '');
        if (code) productsByCode.set(code, [...(productsByCode.get(code) ?? []), product]);
      }
      setMetadataReview(metadataRows.map(row => ({
        productId: row.local.productId,
        vehicles: (row.source?.compatibleVehicles ?? []).map(vehicle => {
          const group = stripCatalogNumber(String(vehicle.vehicleGroup ?? '')).replace(/^محصولات\s*/, '').replace(/^محصول\s*/, '').trim();
          const source = stripCatalogNumber(String(vehicle.vehicleModel ?? ''));
          const exact = vehicleModels.filter(model => normalizeName(`${model.makeName} ${model.modelName}`.trim()) === normalizeName(source) && (!group || normalizeName(model.makeName) === normalizeName(group)));
          const candidates = exact.length ? exact : vehicleModels.filter(model => normalizeName(model.modelName) === normalizeName(source));
          return { source: [vehicle.vehicleGroup, vehicle.vehicleModel, vehicle.bodyStyle, vehicle.trim].filter(Boolean).map(String).join(' / '), matches: [...new Map(candidates.map(model => [model.modelId, `${model.makeName} ${model.modelName}`.trim()])).values()] };
        }),
        replacements: [...new Set([...(row.source?.replacementCodes ?? []), ...(row.source?.alternativeCodes ?? [])].map(normalizeLookupCode).filter(Boolean))].map(code => ({ code, matches: (productsByCode.get(code) ?? []).map(product => `${product.productCode ?? ''} · ${product.productName}`) })),
        images: (row.source?.imageFiles ?? []).map(file => { const name = file.split(/[\\/]/).pop() ?? ''; return { file, available: assetFiles.has(name) || serverAssetNames.has(name) }; }),
      })));
      setRows(report);
      // Price changes require an explicit review and checkbox selection.
      setSelected(current => current.filter(id => report.some(row => row.local.productId === id)));
      setSelectedIsacoCodes(current => current.filter(id => report.some(row => row.local.productId === id)));
      setMessage(`پیش‌نمایش برای ${catalog.length.toLocaleString('fa-IR')} محصول فروشگاه آماده شد.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'دریافت فهرست محصولات فروشگاه ناموفق بود.');
    } finally { setBusy(false); }
  }

  async function applySelected() {
    if (!rows || !selected.length) return;
    const selectedPriceIds = selected.filter(id => rows.some(row => row.local.productId === id && row.canUpdate && row.proposedPrice !== null));
    if (!selectedPriceIds.length) return;
    if (selectedPriceIds.length > 500) { setError('در هر نوبت حداکثر ۵۰۰ قیمت را اعمال کنید.'); return; }
    if (!window.confirm(`قیمت ${selectedPriceIds.length.toLocaleString('fa-IR')} محصول انتخاب‌شده در فروشگاه ثبت شود؟`)) return;
    setBusy(true); setError(''); setMessage('');
    const outcomes: { id: number; ok: boolean; reason?: string }[] = [];
    for (const id of selectedPriceIds) {
      const row = rows.find(item => item.local.productId === id);
      if (!row?.canUpdate || row.proposedPrice === null) continue;
      try {
        const result = await api<any>(`api/ProductPricing/${id}/base-price`, { method: 'PATCH', query: { newPrice: row.proposedPrice } });
        outcomes.push({ id, ok: result?.isSuccess !== false && result?.IsSuccess !== false });
      } catch (cause) {
        outcomes.push({ id, ok: false, reason: cause instanceof Error ? cause.message : 'خطای سرور' });
      }
    }
    const succeeded = new Set(outcomes.filter(item => item.ok).map(item => item.id));
    setSelected(current => current.filter(id => !succeeded.has(id)));
    setRows(current => current?.map(row => succeeded.has(row.local.productId) ? { ...row, local: { ...row.local, basePrice: row.proposedPrice } } : row) ?? null);
    const failed = outcomes.filter(item => !item.ok);
    setMessage(`${succeeded.size.toLocaleString('fa-IR')} قیمت ثبت شد${failed.length ? `؛ ${failed.length.toLocaleString('fa-IR')} مورد ناموفق بود` : ''}.`);
    if (failed.length) setError(`ثبت محصول‌های ${failed.map(item => item.id).join('، ')} ناموفق بود. ${failed[0]?.reason ?? ''}`);
    setBusy(false);
  }

  async function saveSelectedIsacoCodes() {
    if (!rows || !selectedIsacoCodes.length) return;
    const chosenRows = rows.filter(row => selectedIsacoCodes.includes(row.local.productId)
      && !!row.proposedIsacoCode?.trim()
      && normalizeLookupCode(row.proposedIsacoCode) !== normalizeLookupCode(row.local.isacoCode ?? ''));
    if (!chosenRows.length) return;
    if (chosenRows.length > 500) { setError('در هر نوبت حداکثر ۵۰۰ کد ایساکو ثبت کنید.'); return; }
    if (!window.confirm(`کد ایساکوی انتخاب‌شده برای ${chosenRows.length.toLocaleString('fa-IR')} محصول ثبت شود؟ کد IKCO/فروشگاه تغییر نمی‌کند.`)) return;
    setBusy(true); setError(''); setMessage('');
    const outcomes: { id: number; code: string; ok: boolean; reason?: string }[] = [];
    for (const row of chosenRows) {
      const code = row.proposedIsacoCode!.trim();
      try {
        const result = await api<any>(`api/Product/${row.local.productId}/isaco-code`, { method: 'PATCH', body: { isacoCode: code } });
        outcomes.push({ id: row.local.productId, code, ok: result?.isSuccess !== false && result?.IsSuccess !== false });
      } catch (cause) {
        outcomes.push({ id: row.local.productId, code, ok: false, reason: cause instanceof Error ? cause.message : 'خطای سرور' });
      }
    }
    const succeeded = new Map(outcomes.filter(item => item.ok).map(item => [item.id, item.code]));
    setSelectedIsacoCodes(current => current.filter(id => !succeeded.has(id)));
    setRows(current => current?.map(row => succeeded.has(row.local.productId)
      ? { ...row, local: { ...row.local, isacoCode: succeeded.get(row.local.productId)! } }
      : row) ?? null);
    const failed = outcomes.filter(item => !item.ok);
    setMessage(`${succeeded.size.toLocaleString('fa-IR')} کد ایساکو ثبت شد${failed.length ? `؛ ${failed.length.toLocaleString('fa-IR')} مورد ناموفق بود` : ''}.`);
    if (failed.length) setError(`ثبت کد محصولات ${failed.map(item => item.id).join('، ')} ناموفق بود. ${failed[0]?.reason ?? ''}`);
    setBusy(false);
  }

  function selectPriceOption(productId: number, option: IsacoPriceOption) {
    const optionKey = priceOptionKey(option);
    setRows(current => current?.map(row => {
      if (row.local.productId !== productId || !row.source) return row;
      const source = { ...row.source, ...option };
      const proposedPrice = source[priceField];
      const validPrice = typeof proposedPrice === 'number' && Number.isFinite(proposedPrice) && proposedPrice >= 0;
      return {
        ...row, source, match: row.resolvedBy ?? 'code', selectedPriceOptionKey: optionKey,
        proposedIsacoCode: option.procurementCode || option.procurementCodes?.[0] || source.code || null,
        proposedPrice: validPrice ? proposedPrice : null, canUpdate: validPrice,
        reason: validPrice ? 'گزینهٔ ایساکو انتخاب شد؛ آمادهٔ ثبت پس از بازبینی' : 'قیمت این گزینه برای نوع قیمت مقصد موجود نیست.',
      };
    }) ?? null);
  }

  function changePriceField(field: IsacoPriceField) {
    setPriceField(field);
    setRows(current => current?.map(row => {
      if (!row.source || row.match === 'unmatched') return row;
      const proposedPrice = row.source[field];
      const validPrice = typeof proposedPrice === 'number' && Number.isFinite(proposedPrice) && proposedPrice >= 0;
      return { ...row, proposedPrice: validPrice ? proposedPrice : null, canUpdate: validPrice,
        reason: validPrice ? row.reason : 'قیمت انتخاب‌شده معتبر نیست.' };
    }) ?? null);
  }

  async function applySelectedCatalogMetadata() {
    if (!rows) return;
    const selectedRows = rows.filter(row => selected.includes(row.local.productId) && hasImportableMetadata(row.source));
    if (!selectedRows.length) return;
    if (selectedRows.length > 500) { setError('در هر نوبت حداکثر ۵۰۰ محصول را برای مشخصات کاتالوگ انتخاب کنید.'); return; }

    const productByCode = new Map<string, StoreProduct[]>();
    for (const row of rows) {
      const code = normalizeLookupCode(row.local.productCode ?? '');
      if (code) productByCode.set(code, [...(productByCode.get(code) ?? []), row.local]);
    }
    let vehicleModels: StoreVehicleModel[] = [];
    if (selectedRows.some(row => row.source?.compatibleVehicles?.length)) {
      try {
        const response = await api<any>('api/vehicles/models');
        vehicleModels = unwrapList(response).map((model: any) => ({
          modelId: Number(model.modelId ?? model.ModelId ?? model.vehicleModelId ?? model.VehicleModelId ?? model.vehicleGenerationId ?? model.VehicleGenerationId),
          makeId: Number(model.vehicleMakeId ?? model.VehicleMakeId),
          makeName: String(model.makeName ?? model.MakeName ?? ''),
          modelName: String(model.name ?? model.Name ?? ''),
          isActive: (model.isActive ?? model.IsActive) !== false,
        })).filter(model => model.modelId > 0 && model.modelName && model.isActive);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'دریافت مدل‌های خودرو از فروشگاه ناموفق بود.');
        return;
      }
    }

    const vehicleIdsByProduct = new Map<number, Set<number>>();
    const relations = new Map<string, { productId: number; relatedProductId: number; relationshipType: 'Alternative'; displayOrder: number }>();
    let unmappedVehicles = 0;
    let unmatchedReplacementCodes = 0;
    for (const row of selectedRows) {
      for (const configuration of row.source?.compatibleVehicles ?? []) {
        const group = stripCatalogNumber(String(configuration.vehicleGroup ?? '')).replace(/^محصولات\s*/, '').replace(/^محصول\s*/, '').trim();
        const sourceModel = stripCatalogNumber(String(configuration.vehicleModel ?? ''));
        if (!sourceModel) { unmappedVehicles += 1; continue; }
        const exact = vehicleModels.filter(model => {
          const combined = `${model.makeName} ${model.modelName}`.trim();
          return normalizeName(combined) === normalizeName(sourceModel) && (!group || normalizeName(model.makeName) === normalizeName(group));
        });
        const exactModelOnly = exact.length ? exact : vehicleModels.filter(model => normalizeName(model.modelName) === normalizeName(sourceModel));
        const uniqueModels = [...new Map(exactModelOnly.map(model => [model.modelId, model])).values()];
        if (uniqueModels.length !== 1) { unmappedVehicles += 1; continue; }
        const idSet = vehicleIdsByProduct.get(row.local.productId) ?? new Set<number>();
        idSet.add(uniqueModels[0].modelId);
        vehicleIdsByProduct.set(row.local.productId, idSet);
      }

      const relationCodes = [...new Set([...(row.source?.replacementCodes ?? []), ...(row.source?.alternativeCodes ?? [])].map(normalizeLookupCode).filter(Boolean))];
      for (const code of relationCodes) {
        const matches = productByCode.get(code) ?? [];
        if (matches.length !== 1 || matches[0].productId === row.local.productId) { unmatchedReplacementCodes += 1; continue; }
        const target = matches[0];
        for (const [productId, relatedProductId] of [[row.local.productId, target.productId], [target.productId, row.local.productId]]) {
          const key = `${productId}:${relatedProductId}:Alternative`;
          relations.set(key, { productId, relatedProductId, relationshipType: 'Alternative', displayOrder: 1 });
        }
      }
    }

    const imageTasks = new Map<string, { productId: number; file?: File; imageName: string; title: string; alt: string }>();
    let missingImages = 0;
    for (const row of selectedRows) {
      for (const imagePath of row.source?.imageFiles ?? []) {
        const filename = imagePath.split(/[\\/]/).pop() ?? imagePath;
        const file = assetFiles.get(filename);
        if (!file && !serverAssetNames.has(filename)) { missingImages += 1; continue; }
        const title = `Isaco EPC diagram ${filename}`;
        imageTasks.set(`${row.local.productId}:${filename}`, {
          productId: row.local.productId,
          file,
          imageName: filename,
          title,
          alt: `${row.local.productName} · نقشهٔ کاتالوگ ایساکو${row.source?.imageGuideNumber ? ` · راهنمای تصویر ${row.source.imageGuideNumber}` : ''}`,
        });
      }
    }
    if (imageTasks.size > 500) { setError('در هر نوبت حداکثر ۵۰۰ تصویر کاتالوگ را بارگذاری کنید.'); return; }
    const modelLinkCount = [...vehicleIdsByProduct.values()].reduce((sum, ids) => sum + ids.size, 0);
    if (!modelLinkCount && !relations.size && !imageTasks.size) {
      setError(`موردی برای ثبت دقیق نگاشت نشد. ${unmappedVehicles.toLocaleString('fa-IR')} سازگاری، ${unmatchedReplacementCodes.toLocaleString('fa-IR')} کد جایگزین و ${missingImages.toLocaleString('fa-IR')} تصویر نیازمند نگاشت/انتخاب پوشه هستند.`);
      return;
    }
    if (!window.confirm(`برای ${vehicleIdsByProduct.size.toLocaleString('fa-IR')} محصول، ${modelLinkCount.toLocaleString('fa-IR')} اتصال خودرو، ${relations.size.toLocaleString('fa-IR')} رابطهٔ جایگزین و ${imageTasks.size.toLocaleString('fa-IR')} نقشهٔ محصول ثبت شود؟ فقط تطبیق‌های دقیق اعمال می‌شوند.`)) return;

    setBusy(true); setError(''); setMessage('');
    const failedProducts: number[] = [];
    let linkedModels = 0;
    let linkedAlternatives = 0;
    let uploadedImages = 0;
    const failedImages: string[] = [];
    try {
      for (const [productId, ids] of vehicleIdsByProduct) {
        try {
          const result = await api<any>(`api/Product/${productId}/vehicle-models`, { method: 'POST', body: [...ids] });
          linkedModels += Number(result?.added ?? result?.Added ?? ids.size);
        } catch {
          failedProducts.push(productId);
        }
      }
      const relationshipRows = [...relations.values()];
      for (let offset = 0; offset < relationshipRows.length; offset += 2_000) {
        const result = await api<any>('api/ProductRelated/bulk-upsert', {
          method: 'POST', body: { items: relationshipRows.slice(offset, offset + 2_000) },
        });
        linkedAlternatives += Number(result?.added ?? result?.Added ?? 0);
      }
      const knownImagesByProduct = new Map<number, Set<string>>();
      for (const task of imageTasks.values()) {
        try {
          let known = knownImagesByProduct.get(task.productId);
          if (!known) {
            const response = await api<any>(`api/product-images/get-by-product/${task.productId}`);
            known = new Set(unwrapList(response).map((image: any) => String(image.title ?? image.Title ?? '')));
            knownImagesByProduct.set(task.productId, known);
          }
          if (known.has(task.title)) continue;
          const file = task.file ?? await loadAssetFile(task.imageName);
          const formData = new FormData();
          formData.append('file', file);
          formData.append('MediaType', 'Image');
          formData.append('ProductId', String(task.productId));
          formData.append('Caption', task.title);
          formData.append('AltText', task.alt);
          formData.append('DisplayOrder', '500');
          formData.append('IsPrimary', 'false');
          formData.append('IsActive', 'true');
          const uploadResponse = await api<any>('api/product-medias/upload', { method: 'POST', formData });
          const uploaded = unwrapData(uploadResponse);
          const media = uploaded?.media ?? uploaded?.Media ?? {};
          const mediaUrl = String(uploaded?.mediaUrl ?? uploaded?.MediaUrl ?? media.mediaUrl ?? media.MediaUrl ?? '');
          if (!mediaUrl) throw new Error('آدرس فایل بارگذاری‌شده از سرور برنگشت.');
          await api<any>('api/product-images/create', {
            method: 'POST',
            body: { productId: task.productId, imageUrl: mediaUrl, title: task.title, altText: task.alt, isMain: false, displayOrder: 500, imageType: 'Gallery' },
          });
          known.add(task.title);
          uploadedImages += 1;
        } catch (cause) {
          failedImages.push(`${task.productId}: ${cause instanceof Error ? cause.message : 'خطای بارگذاری تصویر'}`);
        }
      }
      const notes = [
        `${linkedModels.toLocaleString('fa-IR')} سازگاری خودرو`,
        `${linkedAlternatives.toLocaleString('fa-IR')} رابطهٔ جایگزین`,
        `${uploadedImages.toLocaleString('fa-IR')} نقشهٔ محصول`,
        `${unmappedVehicles.toLocaleString('fa-IR')} سازگاری نگاشت‌نشده`,
        `${unmatchedReplacementCodes.toLocaleString('fa-IR')} کد جایگزین نگاشت‌نشده`,
        `${missingImages.toLocaleString('fa-IR')} تصویرِ انتخاب‌نشده`,
      ];
      setMessage(`ثبت مشخصات کاتالوگ تمام شد: ${notes.join(' · ')}${failedProducts.length ? ` · ${failedProducts.length} محصول ناموفق` : ''}${failedImages.length ? ` · ${failedImages.length} تصویر ناموفق` : ''}.`);
      if (failedProducts.length || failedImages.length) setError(`خطاها: ${[...failedProducts.map(id => `مدل خودرو محصول ${id}`), ...failedImages.slice(0, 3)].join('؛ ')}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ثبت رابطه‌های کاتالوگ ناموفق بود.');
    } finally {
      setBusy(false);
    }
  }

  const unmatchedKeys = useMemo(() => new Set([
    ...collectorUnmatchedProducts.map(record => record.storeProductKey || normalizeLookupCode(record.code) || `name:${normalizeName(record.name)}`),
    ...collectorUnmatched.map(code => normalizeLookupCode(code)).filter(Boolean),
  ]), [collectorUnmatchedProducts, collectorUnmatched]);
  const unmatchedByKey = useMemo(() => new Map(collectorUnmatchedProducts.map(record => [record.storeProductKey || normalizeLookupCode(record.code) || `name:${normalizeName(record.name)}`, record])), [collectorUnmatchedProducts]);
  const failedKeys = useMemo(() => new Set(collectorFailedProducts.map(record => record.storeProductKey || normalizeLookupCode(record.code) || `name:${normalizeName(record.name)}`)), [collectorFailedProducts]);
  const failedByKey = useMemo(() => new Map(collectorFailedProducts.map(record => [record.storeProductKey || normalizeLookupCode(record.code) || `name:${normalizeName(record.name)}`, record])), [collectorFailedProducts]);

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('fa-IR');
    return (rows ?? []).filter(row => {
      const key = localProductKey(row.local);
      const statusMatch = filter === 'all'
        || (filter === 'found' ? row.match !== 'unmatched' && !failedKeys.has(key)
          : filter === 'multiple' ? row.match === 'ambiguous' || (row.priceOptions?.length ?? 0) > 1
            : filter === 'ready' ? row.canUpdate
          : filter === 'unmatched' ? collectorPartial ? unmatchedKeys.has(key) : row.match === 'unmatched'
            : filter === 'errors' ? failedKeys.has(key)
              : filter === 'missing-isaco' ? !row.local.isacoCode
                : filter === 'needs-choice' ? (row.priceOptions?.length ?? 0) > 1 && !row.selectedPriceOptionKey
                  : row.match === filter);
      const textMatch = !needle || `${row.local.productCode ?? ''} ${row.local.isacoCode ?? ''} ${row.local.productName} ${row.source?.code ?? ''} ${failedByKey.get(key)?.reason ?? ''}`.toLocaleLowerCase('fa-IR').includes(needle);
      return statusMatch && textMatch;
    });
  }, [rows, filter, query, collectorPartial, unmatchedKeys, unmatchedByKey, failedKeys, failedByKey]);

  const unmatched = rows?.filter(row => row.match === 'unmatched').length ?? 0;
  const unmatchedCount = collectorPartial ? collectorUnmatchedProducts.length : unmatched;
  const ambiguous = rows?.filter(row => row.match === 'ambiguous').length ?? 0;
  const foundCount = rows?.filter(row => row.match !== 'unmatched' && !failedKeys.has(localProductKey(row.local))).length ?? 0;
  const multipleCount = rows?.filter(row => row.match === 'ambiguous' || (row.priceOptions?.length ?? 0) > 1).length ?? 0;
  const byCode = rows?.filter(row => row.match === 'code' && row.canUpdate).length ?? 0;
  const byName = rows?.filter(row => row.match === 'exact-name' && row.canUpdate).length ?? 0;
  const selectedPriceCount = rows?.filter(row => selected.includes(row.local.productId) && row.canUpdate).length ?? 0;
  const selectedMetadataCount = rows?.filter(row => selected.includes(row.local.productId) && hasImportableMetadata(row.source)).length ?? 0;
  const selectedIsacoCodeCount = rows?.filter(row => selectedIsacoCodes.includes(row.local.productId)
    && !!row.proposedIsacoCode?.trim()
    && normalizeLookupCode(row.proposedIsacoCode) !== normalizeLookupCode(row.local.isacoCode ?? '')).length ?? 0;
  const safeIsacoProposalIds = rows?.filter(row => !row.local.isacoCode && !!row.proposedIsacoCode?.trim()
    && ((row.priceOptions?.length ?? 0) <= 1 || !!row.selectedPriceOptionKey)).map(row => row.local.productId) ?? [];
  const missingIsacoCodeCount = rows?.filter(row => !row.local.isacoCode).length ?? 0;
  const needsIsacoChoiceCount = rows?.filter(row => (row.priceOptions?.length ?? 0) > 1 && !row.selectedPriceOptionKey).length ?? 0;
  const pageCount = Math.max(1, Math.ceil(visibleRows.length / REVIEW_PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount - 1);
  const pageRows = visibleRows.slice(safePage * REVIEW_PAGE_SIZE, (safePage + 1) * REVIEW_PAGE_SIZE);

  useEffect(() => { setCurrentPage(0); }, [query, filter]);
  useEffect(() => { if (currentPage !== safePage) setCurrentPage(safePage); }, [currentPage, safePage]);

  function downloadUnmatched() {
    if (!rows) return;
    const csvCell = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const notFound = rows.filter(row => row.match === 'ambiguous' || (row.match === 'unmatched' && (!collectorPartial || unmatchedKeys.has(localProductKey(row.local)))));
    const lines = ['شناسه محصول,کد فروشگاه,نام محصول,وضعیت,توضیح', ...notFound.map(row => [row.local.productId, row.local.productCode, row.local.productName, row.match, row.reason].map(csvCell).join(','))];
    const detailedCodes = new Set(collectorUnmatchedProducts.map(record => normalizeLookupCode(record.code)).filter(Boolean));
    lines.push(...collectorUnmatchedProducts.map(record => [ '', record.code, record.name, 'پس از کد و نام دقیق پیدا نشد', record.reason || 'جست‌وجوی کد بدون نتیجه؛ نام دقیق یکتا نیز قیمت نداشت.' ].map(csvCell).join(',')));
    lines.push(...collectorUnmatched.filter(code => !detailedCodes.has(normalizeLookupCode(code))).map(code => [ '', code, '', 'پس از کد و نام دقیق پیدا نشد', '' ].map(csvCell).join(',')));
    const blob = new Blob(['\uFEFF', lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = 'isaco-unmatched.csv'; link.click(); URL.revokeObjectURL(url);
  }

  function selectAll(checked: boolean) {
    const eligible = pageRows.filter(row => row.canUpdate || !!row.proposedIsacoCode || hasCatalogMetadata(row.source)).map(row => row.local.productId);
    setSelected(current => checked ? [...new Set([...current, ...eligible])] : current.filter(id => !pageRows.some(row => row.local.productId === id)));
  }

  return <main className={styles.page} dir="rtl">
    <header className={styles.header}>
      <div><span className={styles.eyebrow}><Activity size={14}/> مرکز یکپارچه‌سازی کاتالوگ</span><h1>همگام‌سازی ایساکو</h1><p>قیمت‌های مطمئن را خودکار ثبت کنید و سازگاری خودرو، جایگزین‌ها، دسته‌ها و نقشه‌های قطعه را پیش از ادغام بازبینی کنید.</p></div>
      <a className={styles.sourceLink} href="https://b2b.isaco.ir/PriceList" target="_blank" rel="noreferrer">بازکردن لیست قیمت ایساکو <RefreshCw size={15}/></a>
    </header>

    <section className={styles.importPanel}>
      <div className={styles.panelIntro}><div className={styles.iconBox}><CircleDollarSign size={20}/></div><div><h2>قیمت‌گیری خودکار</h2><p>برای به‌روزرسانی قیمت فقط «شروع قیمت‌گیری» را بزنید: کالاها از دیتابیس خوانده می‌شوند، از ایساکو استعلام می‌شوند و تطبیق‌های یکتای کد یا نام دقیق خودکار ثبت می‌شوند. موارد مبهم، بی‌نتیجه و خطا گزارش می‌شوند و پیش‌نمایش نتیجه هم خودکار باز می‌شود. فایل ورودی لازم نیست. اجرای اول روی ویندوز پنجرهٔ ورود ایساکو را باز می‌کند؛ روی سرور بدون نمایشگر، نشست ورود باید از قبل در پروفایل کرولر ذخیره شده باشد.</p></div></div>
      <div className={styles.crawlerControls}>
        <div><b>وضعیت کرولر این محیط</b><span>{crawlerStatus.state === 'queued' ? 'در صف شروع' : crawlerStatus.state === 'running' ? `در حال اجرا · ${crawlerStatus.phase === 'updating-store-prices' ? 'ثبت قیمت‌های مطمئن در دیتابیس' : crawlerStatus.mode === 'Prices' ? `جمع‌آوری قیمت${crawlerStatus.workers ? ` با ${crawlerStatus.workers.toLocaleString('fa-IR')} تب` : ''}` : 'پیمایش EPC'}` : crawlerStatus.state === 'cancelling' ? 'در حال لغو و ذخیره checkpoint' : crawlerStatus.state === 'cancelled' ? 'آخرین اجرا لغو شد؛ ادامه از checkpoint ممکن است' : crawlerStatus.state === 'succeeded' ? 'آخرین اجرا با موفقیت تمام شد' : crawlerStatus.state === 'failed' ? 'آخرین اجرا ناموفق بود' : crawlerStatus.state === 'stale' ? 'وضعیت اجرا قدیمی است؛ گزارش را بررسی کنید' : 'آمادهٔ اجرا'}</span>{crawlerStatus.progress && <small>{crawlerStatus.mode === 'Prices' ? `محصول بررسی‌شده: ${(crawlerStatus.progress.completed ?? 0).toLocaleString('fa-IR')} از ${(crawlerStatus.progress.total ?? 0).toLocaleString('fa-IR')}` : `شاخهٔ پیمایش‌شده: ${(crawlerStatus.progress.completedNodes ?? 0).toLocaleString('fa-IR')} · شاخه‌های در صف: ${(crawlerStatus.progress.pendingBranches ?? 0).toLocaleString('fa-IR')}`}{crawlerStatus.progress.current ? ` · مورد فعلی: ${crawlerStatus.progress.current}` : ''}{Number(crawlerStatus.progress.failed ?? 0) > 0 ? ` · خطای قابل‌تلاش مجدد: ${Number(crawlerStatus.progress.failed).toLocaleString('fa-IR')}` : ''}</small>}{crawlerStatus.priceSync && !crawlerStatus.priceSync.skipped && <small>ثبت خودکار: {Number(crawlerStatus.priceSync.updated ?? 0).toLocaleString('fa-IR')} موفق · {Number(crawlerStatus.priceSync.unmatched ?? 0).toLocaleString('fa-IR')} بی‌نتیجه · {Number(crawlerStatus.priceSync.ambiguous ?? 0).toLocaleString('fa-IR')} مبهم · {Number(crawlerStatus.priceSync.failed ?? 0).toLocaleString('fa-IR')} خطا</small>}{crawlerStatus.updatedAt && <small>آخرین تغییر: {new Date(crawlerStatus.updatedAt).toLocaleString('fa-IR')}{crawlerStatus.logFile ? ` · گزارش ${crawlerStatus.logFile}` : ''}</small>}{crawlerStatus.error && <small className={styles.crawlerError}>{crawlerStatus.error}</small>}</div>
        <div className={styles.crawlerActions}><label className={styles.workerSelect}>تعداد تب<select value={priceWorkers} onChange={event => setPriceWorkers(Number(event.target.value))} disabled={busy || ['queued', 'running', 'cancelling'].includes(crawlerStatus.state)}>{Array.from({ length: 12 }, (_, index) => index + 1).map(value => <option key={value} value={value}>{value.toLocaleString('fa-IR')} تب</option>)}</select></label><button type="button" className={styles.primaryButton} onClick={() => void startCrawler('Prices')} disabled={busy || ['queued', 'running', 'cancelling'].includes(crawlerStatus.state) || !crawlerStatus.availableModes?.includes('Prices')}><CircleDollarSign size={16}/>ادامهٔ قیمت‌گیری</button><button type="button" className={styles.metadataButton} onClick={() => void startCrawler('Prices', true)} disabled={busy || ['queued', 'running', 'cancelling'].includes(crawlerStatus.state) || !crawlerStatus.availableModes?.includes('Prices')}><RefreshCw size={15}/>شروع از ابتدا</button><button type="button" className={styles.metadataButton} onClick={() => void startCrawler('Epc')} disabled={busy || ['queued', 'running', 'cancelling'].includes(crawlerStatus.state) || !crawlerStatus.availableModes?.includes('Epc')}><PackageSearch size={15}/>شروع پیمایش EPC</button>{['queued', 'running', 'cancelling'].includes(crawlerStatus.state) && <button type="button" className={styles.cancelButton} onClick={() => void cancelCrawler()} disabled={busy || crawlerStatus.state === 'cancelling'}><X size={16}/>{crawlerStatus.state === 'cancelling' ? 'در حال لغو…' : 'لغو اجرا'}</button>}</div>
      </div>
      <details className={`${styles.resultsPanel} ${styles.manualTools}`}><summary><Upload size={16}/> ابزارهای دستی و بازیابی <span>اختیاری</span></summary><div className={styles.importControls}>
        <button type="button" className={styles.uploadButton} onClick={() => fileRef.current?.click()} disabled={busy}><Upload size={16}/>{filename || 'ورود دستی فایل (اختیاری)'}</button>
        <button type="button" className={styles.uploadButton} onClick={() => void loadLatestFromServer()} disabled={busy}><ArrowDownToLine size={16}/>بارگذاری دوبارهٔ خروجی آخر</button>
        <button type="button" className={styles.uploadButton} onClick={() => void loadLatestFromServer('Epc')} disabled={busy}><ArrowDownToLine size={16}/>بارگذاری دوبارهٔ خروجی EPC</button>
        <input ref={fileRef} className={styles.hiddenInput} type="file" accept="application/json,.json" onChange={event => void importFile(event.target.files?.[0])}/>
        <button type="button" className={styles.uploadButton} onClick={() => assetsRef.current?.click()} disabled={busy}><ImageIcon size={16}/>{assetFolderName || 'انتخاب پوشهٔ تصاویر'}</button>
        <input ref={assetsRef} className={styles.hiddenInput} type="file" multiple {...({ webkitdirectory: '', directory: '' } as any)} onChange={event => {
          const files = Array.from(event.target.files ?? []);
          setAssetFiles(new Map(files.map(file => [file.name, file])));
          setAssetFolderName(files[0]?.webkitRelativePath.split('/')[0] || '');
          setMessage(`${files.length.toLocaleString('fa-IR')} فایل تصویر برای بارگذاری آماده شد.`);
          event.target.value = '';
        }}/>
        <label className={styles.selectLabel}>قیمت مقصد<select value={priceField} onChange={event => changePriceField(event.target.value as IsacoPriceField)}>{priceOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <button type="button" className={styles.primaryButton} onClick={() => void buildPreview()} disabled={!items.length || busy}>{busy ? <LoaderCircle className={styles.spin} size={16}/> : <PackageSearch size={16}/>}ساخت پیش‌نمایش</button>
      </div></details>
      {message && <p className={styles.notice}><Check size={16}/>{message}</p>}
      {error && <div className={styles.error}><AlertTriangle size={17}/><span>{error}</span>{authInvalid && <button type="button" onClick={() => void logout()}>خروج و ورود مجدد</button>}</div>}
      {filename && <div className={styles.fileMeta}><ShieldCheck size={14}/> {items.length.toLocaleString('fa-IR')} ردیف معتبر · آخرین بارگذاری: {filename}</div>}
      {filename && <div className={styles.fileMeta}><ImageIcon size={14}/> {sourceCategories.length.toLocaleString('fa-IR')} دسته‌بندی کرول‌شده · {sourceCategories.filter(category => category.imageFile).length.toLocaleString('fa-IR')} تصویر دسته در snapshot</div>}
      {sourceCategories.length > 0 && <details className={styles.resultsPanel}><summary>بازبینی و نگاشت دسته‌بندی‌ها ({sourceCategories.length.toLocaleString('fa-IR')})</summary><p className={styles.categoryHint}>مقصد هر دسته را از فهرست فروشگاه انتخاب کنید؛ نگاشت‌ها در همین مرورگر ذخیره می‌شوند. این انتخاب‌ها فقط پیش‌نمایش‌اند تا دکمهٔ ثبت دستهٔ محصولات را بزنید.</p><div className={styles.tableToolbar}><span>{selectedCategoryPaths.length.toLocaleString('fa-IR')} تصویر دسته برای ثبت انتخاب شده</span><button type="button" className={styles.applyButton} onClick={() => void applySelectedCategoryImages()} disabled={busy || !selectedCategoryPaths.length}>{busy ? <LoaderCircle className={styles.spin} size={15}/> : <Upload size={15}/>}ثبت تصویر دسته‌های انتخاب‌شده</button></div><div className={styles.tableScroll}><table><thead><tr><th>انتخاب تصویر</th><th>مسیر ایساکو</th><th>دستهٔ مقصد فروشگاه</th><th>تطبیق</th><th>فایل تصویر</th><th>وضعیت تصویر</th></tr></thead><tbody>{sourceCategories.map((category, index) => { const imageName = category.imageFile?.split(/[\\/]/).pop() ?? ''; const match = categoryPreview[index]; const imageReady = !!imageName && (assetFiles.has(imageName) || serverAssetNames.has(imageName)); const canSelect = !!match?.category && imageReady; const pathKey = category.path.join(' / '); return <tr key={`${pathKey}-${index}`}><td><input type="checkbox" aria-label={`انتخاب تصویر دسته ${pathKey}`} disabled={!canSelect || busy} checked={selectedCategoryPaths.includes(pathKey)} onChange={event => { if (!match?.category) return; if (event.target.checked) { const alreadyUsed = sourceCategories.some((other, otherIndex) => otherIndex !== index && selectedCategoryPaths.includes(other.path.join(' / ')) && categoryPreview[otherIndex]?.category?.id === match.category.id); if (alreadyUsed) { setError('برای هر دستهٔ فروشگاه فقط یک تصویر دسته از ایساکو انتخاب کنید.'); return; } setSelectedCategoryPaths(current => [...new Set([...current, pathKey])]); } else setSelectedCategoryPaths(current => current.filter(path => path !== pathKey)); }}/></td><td>{pathKey}</td><td><select className={styles.categorySelect} aria-label={`دستهٔ مقصد برای ${pathKey}`} value={match?.category?.id ?? ''} onChange={event => chooseCategoryMapping(index, Number(event.target.value))}><option value="">بدون نگاشت</option>{localCategories.map(local => <option key={local.id} value={local.id}>{local.path.join(' / ')}</option>)}</select></td><td>{match?.status ?? 'در انتظار بررسی'}</td><td>{imageName || '—'}</td><td>{imageReady ? 'آمادهٔ بارگذاری از سرور/پوشه' : imageName ? 'فایل در سرور یا پوشه نیست' : 'بدون تصویر'}</td></tr>; })}</tbody></table></div></details>}
    </section>

    <section className={styles.flow} aria-label="مراحل کار">
      <span className={styles.flowActive}><b>۱</b> جمع‌آوری خودکار</span><i/><span className={rows ? styles.flowActive : ''}><b>۲</b> تطبیق امن</span><i/><span className={autoPriceApplied ? styles.flowActive : ''}><b>۳</b> ثبت خودکار قیمت‌های مطمئن</span>
    </section>

    {rows && <>
      <section className={styles.metrics}>
        <article><span>قیمت مطابق کد</span><b>{byCode.toLocaleString('fa-IR')}</b><small>کد اختصاصی</small></article>
        <article><span>نام دقیق</span><b>{byName.toLocaleString('fa-IR')}</b><small>تطبیق کامل و یکتا</small></article>
        <article className={styles.warningMetric}><span>پیدا‌نشده</span><b>{unmatchedCount.toLocaleString('fa-IR')}</b><small>{collectorPartial ? 'تأییدشده پس از کد و نام دقیق' : 'کد/نام بدون نتیجه'}</small></article>
        <article className={styles.warningMetric}><span>نیازمند بررسی</span><b>{ambiguous.toLocaleString('fa-IR')}</b><small>تطبیق تکراری</small></article>
      </section>

      <section className={styles.resultsPanel}>
        <div className={styles.resultsHeader}><div><span className={styles.eyebrow}>بازبینی قبل از ثبت</span><h2>نتایج تطبیق</h2><p>{rows.length.toLocaleString('fa-IR')} محصول فروشگاه با {items.length.toLocaleString('fa-IR')} نتیجهٔ ایساکو مقایسه شد.{collectorPartial ? ` · ${collectorUnmatchedProducts.length.toLocaleString('fa-IR')} مورد واقعاً بی‌نتیجه و ${collectorFailedProducts.length.toLocaleString('fa-IR')} مورد خطادار` : ''}</p></div><button type="button" className={styles.exportButton} onClick={downloadUnmatched} disabled={!unmatchedCount && !ambiguous && !collectorUnmatched.length}><ArrowDownToLine size={16}/>خروجی موارد پیدا‌نشده</button></div>
        <div className={styles.tableToolbar}>
          <label className={styles.search}><Search size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="جست‌وجوی کد یا نام"/></label>
          <div className={styles.filters}>
            <div className={styles.filterTabs} role="tablist" aria-label="فیلتر داده‌های محصولات">
              {([
                ['all', `همه (${rows.length})`],
                ['found', `پیدا‌شده (${foundCount})`],
                ['multiple', `چندنتیجه‌ای (${multipleCount})`],
                ['missing-isaco', `بدون کد ایساکو (${missingIsacoCodeCount})`],
                ['needs-choice', `نیازمند انتخاب (${needsIsacoChoiceCount})`],
                ['ready', 'قابل ثبت قیمت'],
                ['unmatched', `پیدا‌نشده (${unmatchedCount})`],
                ['ambiguous', `مبهم (${ambiguous})`],
                ['errors', `خطادار (${collectorFailedProducts.length})`],
              ] as const).map(([value, label]) => <button type="button" role="tab" aria-selected={filter === value} className={filter === value ? styles.activeFilterTab : ''} key={value} onClick={() => { setFilter(value); setCurrentPage(0); }}>{label}</button>)}
            </div>
            <button type="button" className={styles.metadataButton} onClick={() => void applySelectedCategoryMoves()} disabled={busy || !selectedCategoryMoveCount}><PackageSearch size={15}/>اصلاح دستهٔ {selectedCategoryMoveCount.toLocaleString('fa-IR')} محصول</button>
            <button type="button" className={styles.metadataButton} onClick={() => void applySelectedCatalogMetadata()} disabled={busy || !selectedMetadataCount}><ShieldCheck size={15}/>ثبت سازگاری و جایگزین‌ها ({selectedMetadataCount.toLocaleString('fa-IR')})</button>
            <button type="button" className={styles.metadataButton} onClick={() => setSelectedIsacoCodes(current => [...new Set([...current, ...safeIsacoProposalIds])])} disabled={busy || !safeIsacoProposalIds.length}><Check size={15}/>انتخاب کدهای یکتای پیشنهادی ({safeIsacoProposalIds.length.toLocaleString('fa-IR')})</button>
            <button type="button" className={styles.metadataButton} onClick={() => void saveSelectedIsacoCodes()} disabled={busy || !selectedIsacoCodeCount}><Check size={15}/>ثبت {selectedIsacoCodeCount.toLocaleString('fa-IR')} کد ایساکو</button>
            {!autoPriceApplied && <button type="button" className={styles.applyButton} onClick={() => void applySelected()} disabled={busy || !selectedPriceCount}>{busy ? <LoaderCircle className={styles.spin} size={15}/> : <CircleDollarSign size={16}/>}ثبت {selectedPriceCount.toLocaleString('fa-IR')} قیمت</button>}
          </div>
        </div>
        <div className={styles.tableScroll}><table><thead><tr><th><input type="checkbox" aria-label="انتخاب همه نتایج این صفحه" checked={pageRows.some(row => row.canUpdate || !!row.proposedIsacoCode || hasCatalogMetadata(row.source)) && pageRows.filter(row => row.canUpdate || !!row.proposedIsacoCode || hasCatalogMetadata(row.source)).every(row => selected.includes(row.local.productId))} onChange={event => selectAll(event.target.checked)}/></th><th>شمارهٔ IKCO</th><th>نام محصول</th><th>کد پیدا‌شده در ایساکو</th><th>کد ایساکوی ثبت‌شده / پیشنهادی</th><th>تطبیق</th><th>قیمت فعلی</th><th>قیمت جدید</th><th>دستهٔ فعلی ← مقصد</th><th>کاتالوگ، سازگاری و عکس</th><th>وضعیت</th></tr></thead><tbody>
          {pageRows.map(row => {
            const key = localProductKey(row.local);
            const isPending = collectorPartial && row.match === 'unmatched' && !unmatchedKeys.has(key) && !failedKeys.has(key);
            const failedReason = failedByKey.get(key)?.reason;
            const unmatchedResult = unmatchedByKey.get(key);
            const matchLabel = isPending ? 'در انتظار بررسی' : failedReason ? 'خطای کرولر' : row.match === 'code' ? 'کد دقیق' : row.match === 'exact-name' ? 'نام دقیق' : row.match === 'ambiguous' ? 'مبهم' : 'بی‌نتیجه';
            return <tr key={row.local.productId}>
            <td>{(row.canUpdate || !!row.proposedIsacoCode || hasCatalogMetadata(row.source)) && <input type="checkbox" aria-label={`انتخاب ${row.local.productName}`} checked={selected.includes(row.local.productId)} onChange={event => setSelected(current => event.target.checked ? [...new Set([...current, row.local.productId])] : current.filter(id => id !== row.local.productId))}/>}</td>
            <td>{row.local.productCode || '—'}</td><td className={styles.productName}>{row.local.productName}</td><td>
              {row.source?.code || '—'}
              {!!row.priceOptions?.length && row.priceOptions.length > 1 && <div className={styles.priceChoice}>
                <b>برای این محصول {row.priceOptions.length.toLocaleString('fa-IR')} گزینه پیدا شد؛ یکی را انتخاب کنید</b>
                {row.priceOptions.map((option, index) => <label className={styles.priceChoiceOption} key={`${priceOptionKey(option)}-${index}`}>
                  <input type="radio" name={`isaco-option-${row.local.productId}`} checked={row.selectedPriceOptionKey === priceOptionKey(option)} onChange={() => selectPriceOption(row.local.productId, option)}/>
                  <span>{[option.procurementCodes?.length ? `کد ${option.procurementCodes.join('، ')}` : option.procurementCode ? `کد ${option.procurementCode}` : '', option.brand || 'بدون مارک/گارانتی', option.unit].filter(Boolean).join(' · ')} — {formatPrice(option[priceField])}</span>
                </label>)}
                <small>{row.source?.name || row.local.productName}</small>
              </div>}
            </td>
            <td className={styles.isacoCodeCell}>
              <b>{row.local.isacoCode || 'ثبت نشده'}</b>
              {row.proposedIsacoCode && <small>پیشنهاد: <code>{row.proposedIsacoCode}</code></small>}
              {row.proposedIsacoCode && normalizeLookupCode(row.proposedIsacoCode) !== normalizeLookupCode(row.local.isacoCode ?? '') && <label className={styles.codeApplyChoice}>
                <input type="checkbox" aria-label={`انتخاب کد ایساکو برای ${row.local.productName}`} checked={selectedIsacoCodes.includes(row.local.productId)} disabled={busy} onChange={event => setSelectedIsacoCodes(current => event.target.checked ? [...new Set([...current, row.local.productId])] : current.filter(id => id !== row.local.productId))}/>
                انتخاب برای ثبت
              </label>}
            </td>
            <td><span className={`${styles.matchBadge} ${row.match === 'code' ? styles.matchCode : row.match === 'exact-name' ? styles.matchName : styles.matchNone}`}>{matchLabel}</span></td>
            <td>{formatPrice(row.local.basePrice)}</td><td className={styles.newPrice}>{formatPrice(row.proposedPrice)}</td>
            <td className={styles.categoryMoveCell}>{(() => { const currentId = Number(row.local.categoryId ?? 0); const current = localCategories.find(category => category.id === currentId); const suggested = resolveProductCategory(row.source); const targetId = Number(suggested?.id ?? 0); const hasManyPaths = (row.source?.categoryPaths?.length ?? 0) > 1; return <><span>{current?.path.join(' / ') || row.local.categoryName || 'بدون دسته'}</span><small>← {suggested?.path?.join(' / ') || suggested?.name || (hasManyPaths ? 'چند مسیر؛ نگاشت همه مسیرها لازم است' : 'نگاشت نشده')}</small><b className={(targetId && targetId !== currentId) || (hasManyPaths && !suggested) ? styles.moveNeeded : styles.moveOk}>{targetId ? targetId !== currentId ? 'نیازمند اصلاح' : 'درست است' : hasManyPaths ? 'نگاشت کامل لازم است' : 'بدون پیشنهاد'}</b></>; })()}</td>
            <td className={styles.assetsCell}>
              {row.source?.categoryPath?.length ? <span title={row.source.categoryPath.join(' / ')}>{row.source.categoryPath.join(' / ')}</span> : '—'}
              {row.source?.imageUrls?.length ? <a href={row.source.imageUrls[0]} target="_blank" rel="noreferrer" className={styles.imageLink}><ImageIcon size={15}/>مشاهده تصویر</a> : null}
              {row.source?.imageFiles?.length ? <span className={styles.localImage} title={row.source.imageFiles.join('\n')}><ImageIcon size={14}/>{row.source.imageFiles.length.toLocaleString('fa-IR')} نقشهٔ قطعه در پوشهٔ خروجی</span> : null}
              {row.source?.categoryImageFiles?.length ? <span className={styles.localImage} title={row.source.categoryImageFiles.join('\n')}><ImageIcon size={14}/>{row.source.categoryImageFiles.length.toLocaleString('fa-IR')} تصویر دسته در پوشهٔ خروجی</span> : null}
              {row.source?.compatibleVehicles?.length ? <span className={styles.localImage} title={row.source.compatibleVehicles.map(vehicle => String(vehicle.description ?? '')).join('\n')}>{row.source.compatibleVehicles.length.toLocaleString('fa-IR')} تیپ سازگار</span> : null}
              {row.source?.replacementCodes?.length ? <span className={styles.localImage} title={row.source.replacementText}>جایگزین: {row.source.replacementCodes.join('، ')}</span> : null}
              {row.source?.alternativeCodes?.length ? <span className={styles.localImage} title={row.source.alternativeText}>آلترناتیو: {row.source.alternativeCodes.join('، ')}</span> : null}
              {row.source?.imageGuideNumber ? <small>راهنمای تصویر {row.source.imageGuideNumber}{row.source.applicationCount ? ` · ${row.source.applicationCount} کاربرد` : ''}</small> : null}
              {hasCatalogMetadata(row.source) && <details className={styles.catalogDetails}><summary>بازبینی همه داده‌های کاتالوگ</summary><div className={styles.catalogReview}>
                <b>دسته‌بندی</b><span>{row.source?.categoryPath?.join(' / ') || 'در خروجی موجود نیست'}</span>
                <b>خودروهای سازگار ({row.source?.compatibleVehicles?.length ?? 0})</b><span>{row.source?.compatibleVehicles?.length ? row.source.compatibleVehicles.map((vehicle, index) => <i key={`${index}-${vehicle.vehicleModel ?? ''}`}>{[vehicle.vehicleGroup, vehicle.vehicleModel, vehicle.bodyStyle, vehicle.trim].filter(Boolean).map(String).join(' / ')}{vehicle.description ? ` — ${vehicle.description}` : ''}</i>) : 'ندارد'}</span>
                <b>کدهای جایگزین</b><span>{row.source?.replacementCodes?.length ? row.source.replacementCodes.join('، ') : 'ندارد'}{row.source?.replacementText ? ` — ${row.source.replacementText}` : ''}</span>
                <b>کدهای آلترناتیو</b><span>{row.source?.alternativeCodes?.length ? row.source.alternativeCodes.join('، ') : 'ندارد'}{row.source?.alternativeText ? ` — ${row.source.alternativeText}` : ''}</span>
                <b>عکس‌ها و نقشه‌ها</b><span>{[...(row.source?.imageFiles ?? []), ...(row.source?.imageUrls ?? [])].length ? [...(row.source?.imageFiles ?? []), ...(row.source?.imageUrls ?? [])].map((image, index) => <i key={`${index}-${image}`}>{image}{row.source?.imageFiles?.includes(image) ? (assetFiles.has(image.split(/[\\/]/).pop() ?? '') || serverAssetNames.has(image.split(/[\\/]/).pop() ?? '') ? ' · فایل موجود' : ' · فایل در خروجی سرور/پوشه نیست') : ''}</i>) : 'ندارد'}</span>
                <b>نتیجهٔ تطبیق مقصد</b><span>{metadataReview.find(review => review.productId === row.local.productId) ? <>
                  {metadataReview.find(review => review.productId === row.local.productId)?.vehicles.map((vehicle, index) => <i key={`v-${index}`}>خودرو «{vehicle.source || 'نامشخص'}» ← {vehicle.matches.length === 1 ? `${vehicle.matches[0]} · تطبیق یکتا` : vehicle.matches.length ? `${vehicle.matches.join('، ')} · مبهم` : 'مدل مقصد پیدا نشد'}</i>)}
                  {metadataReview.find(review => review.productId === row.local.productId)?.replacements.map((replacement, index) => <i key={`r-${index}`}>کد {replacement.code} ← {replacement.matches.length === 1 ? `${replacement.matches[0]} · تطبیق یکتا` : replacement.matches.length ? `${replacement.matches.join('، ')} · مبهم` : 'محصول مقصد پیدا نشد'}</i>)}
                  {metadataReview.find(review => review.productId === row.local.productId)?.images.map((image, index) => <i key={`i-${index}`}>{image.file} · {image.available ? 'آمادهٔ بارگذاری' : 'فایل انتخاب نشده'}</i>)}
                </> : 'پیش‌نمایش نگاشت در دسترس نیست'}</span>
                <b>توضیحات فنی</b><span>{row.source?.technicalDescription || 'ندارد'}</span>
              </div><details className={styles.rawCatalog}><summary>نمایش تمام فیلدهای منبع</summary><pre>{JSON.stringify(row.source, null, 2)}</pre></details></details>}
            </td>
            <td><span className={row.canUpdate ? styles.readyState : styles.notReadyState}>{row.canUpdate ? 'آماده ثبت' : failedReason ? `خطای کرولر${failedByKey.get(key)?.worker ? ` · تب ${failedByKey.get(key)?.worker}` : ''}: ${failedReason}` : isPending ? 'در اجرای ناقص هنوز بررسی نشده' : unmatchedResult ? `کد: ${unmatchedResult.codeSearch === 'not-found' ? 'پیدا نشد' : 'نداشت'} · نام دقیق: ${unmatchedResult.nameSearch === 'not-found' ? 'پیدا نشد' : 'نداشت'}${unmatchedResult.reason ? ` · ${unmatchedResult.reason}` : ''}` : row.reason}</span></td>
          </tr>;
          })}
          {!pageRows.length && <tr><td colSpan={10} className={styles.empty}>با این فیلتر موردی پیدا نشد.</td></tr>}
        </tbody></table></div>
        <div className={styles.pagination}><span>{visibleRows.length.toLocaleString('fa-IR')} نتیجه · صفحهٔ {(safePage + 1).toLocaleString('fa-IR')} از {pageCount.toLocaleString('fa-IR')} · {REVIEW_PAGE_SIZE.toLocaleString('fa-IR')} ردیف در هر صفحه</span><div><button type="button" onClick={() => setCurrentPage(page => Math.max(0, page - 1))} disabled={safePage === 0}>قبلی</button><button type="button" onClick={() => setCurrentPage(page => Math.min(pageCount - 1, page + 1))} disabled={safePage >= pageCount - 1}>بعدی</button></div></div>
        <footer className={styles.tableFooter}><span><ShieldCheck size={14}/> تطبیق نام تنها وقتی انجام می‌شود که نام نرمال‌شده دقیقاً برابر و یکتا باشد.</span><span>{pageRows.length.toLocaleString('fa-IR')} ردیف این صفحه</span></footer>
      </section>
    </>}

    {!rows && <section className={styles.emptyState}><div><PackageSearch size={24}/></div><h2>هنوز پیش‌نمایشی ساخته نشده</h2><p>برای شروع، «شروع جمع‌آوری قیمت» را بزنید. محصولات مستقیماً از دیتابیس فروشگاه خوانده می‌شوند و فایل ورودی لازم نیست.</p><button type="button" onClick={() => void startCrawler('Prices')} disabled={busy || ['queued', 'running', 'cancelling'].includes(crawlerStatus.state) || !crawlerStatus.availableModes?.includes('Prices')}><RefreshCw size={16}/>شروع جمع‌آوری قیمت</button></section>}
  </main>;
}

