'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { api, unwrapList } from '@/lib/api';
import { useToast } from './Toast';
import { ProductReferenceField } from './ProductReferenceField';

type Action = { projectActionId: number; actionName: string; httpMethod: string; route: string; description?: string; isSensitive?: boolean; isAccess: boolean };
type Controller = { projectControllerId: number; controllerName: string; moduleName?: string; areaName?: string; baseRoute?: string; actions: Action[] };
const pick = (row: any, ...keys: string[]) => {
  for (const key of keys) {
    const actual = Object.keys(row ?? {}).find((name) => name.toLowerCase() === key.toLowerCase());
    if (actual && row[actual] !== undefined) return row[actual];
  }
  return undefined;
};

export function Permissions() {
  const { show } = useToast();
  const [roles, setRoles] = useState<any[]>([]);
  const [roleId, setRoleId] = useState('');
  const [tree, setTree] = useState<Controller[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    api('api/Roles/GetAll').then((response) => setRoles(unwrapList(response))).catch((cause) => show(cause.message, 'error'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async (selectedRole = roleId) => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      const response = await api(`api/Permissions/GetProjectStructure/${selectedRole}`);
      setTree(unwrapList(response));
      setDirty(false);
    } catch (cause: any) { show(cause.message, 'error'); }
    finally { setLoading(false); }
  };

  const changeAction = (actionId: number, allowed: boolean) => {
    setTree((current) => current.map((controller) => ({ ...controller, actions: controller.actions.map((action) => action.projectActionId === actionId ? { ...action, isAccess: allowed } : action) })));
    setDirty(true);
  };
  const changeController = (controllerId: number, allowed: boolean) => {
    setTree((current) => current.map((controller) => controller.projectControllerId === controllerId ? { ...controller, actions: controller.actions.map((action) => ({ ...action, isAccess: allowed })) } : controller));
    setDirty(true);
  };
  const save = async () => {
    if (!roleId) return;
    setBusy(true);
    try {
      const permissions = tree.flatMap((controller) => controller.actions.map((action) => ({ projectActionId: action.projectActionId, isAccess: action.isAccess })));
      await api('api/Permissions/UpdateRolePermissions', { method: 'POST', body: { roleId: Number(roleId), permissions } });
      show('دسترسی‌های نقش ذخیره شد.');
      setDirty(false);
    } catch (cause: any) { show(cause.message, 'error'); }
    finally { setBusy(false); }
  };
  const rescan = async () => {
    setBusy(true);
    try { await api('api/Permissions/RescanSystemActions', { method: 'POST' }); show('ساختار Actionها همگام شد.'); await load(); }
    catch (cause: any) { show(cause.message, 'error'); }
    finally { setBusy(false); }
  };
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return tree.map((controller) => ({ ...controller, actions: controller.actions.filter((action) => !term || `${controller.controllerName} ${controller.moduleName ?? ''} ${action.actionName} ${action.route} ${action.description ?? ''}`.toLocaleLowerCase().includes(term)) })).filter((controller) => controller.actions.length);
  }, [tree, query]);

  return <>
    <div className="page-head"><div><div className="eyebrow">کاربران و دسترسی</div><h1>سطوح دسترسی</h1><p>مجوزهای هر نقش را بر اساس Controller و Action بررسی و گروهی ذخیره کنید.</p></div><button className="ghost" type="button" disabled={busy} onClick={() => void rescan()}>↻ همگام‌سازی Actionها</button></div>
    <div className="card permissions-head"><label><span>نقش</span><select value={roleId} onChange={(event) => { setRoleId(event.target.value); setTree([]); setDirty(false); }}><option value="">انتخاب نقش</option>{roles.map((role, index) => <option key={pick(role, 'roleId', 'id') ?? index} value={pick(role, 'roleId', 'id')}>{pick(role, 'displayName', 'roleName', 'name', 'title') ?? `نقش ${index + 1}`}</option>)}</select></label><button className="primary" type="button" disabled={!roleId || loading} onClick={() => void load()}>{loading ? 'در حال دریافت...' : 'بارگذاری مجوزها'}</button>{tree.length > 0 && <button className="primary" type="button" disabled={!dirty || busy} onClick={() => void save()}>{busy ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</button>}</div>
    {tree.length > 0 && <div className="toolbar"><div className="searchbox"><Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی Controller، Action یا مسیر" aria-label="جست‌وجوی مجوزها"/></div><span className="count">{filtered.reduce((sum, item) => sum + item.actions.length, 0).toLocaleString('fa-IR')} اکشن</span></div>}
    {loading ? <div className="loading card"><i/><span>در حال دریافت ساختار دسترسی‌ها...</span></div> : tree.length === 0 ? <div className="empty card"><b>{roleId ? 'ساختار مجوزی برای این نقش بارگذاری نشده است' : 'یک نقش انتخاب کنید'}</b><span>{roleId ? 'دکمهٔ بارگذاری مجوزها را بزنید.' : 'پس از انتخاب نقش، دسترسی‌های آن را مدیریت کنید.'}</span></div> : <div className="permission-controller-list">{filtered.map((controller) => <section className="card permission-controller" key={controller.projectControllerId}><header><div><b>{controller.controllerName}</b><span>{controller.moduleName ?? controller.areaName ?? 'عمومی'} · {controller.baseRoute ?? ''}</span></div><label><input type="checkbox" checked={controller.actions.length > 0 && controller.actions.every((action) => action.isAccess)} onChange={(event) => changeController(controller.projectControllerId, event.target.checked)}/><span>فعال‌سازی همه</span></label></header><div className="permission-action-list">{controller.actions.map((action) => <label className="permission-action" key={action.projectActionId}><input type="checkbox" checked={!!action.isAccess} onChange={(event) => changeAction(action.projectActionId, event.target.checked)}/><span><b>{action.actionName}</b><small dir="ltr">{action.httpMethod} {action.route}</small>{action.description && <small>{action.description}</small>}</span>{action.isSensitive && <em>حساس</em>}</label>)}</div></section>)}{filtered.length === 0 && <div className="empty card small">اکشنی با این عبارت پیدا نشد.</div>}</div>}
  </>;
}

export function Reviews() {
  const { show } = useToast();
  const [productId, setProductId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const load = async () => {
    if (!productId) return;
    setLoading(true); setHasLoaded(true);
    try {
      const [reviewResponse, questionResponse] = await Promise.all([
        api(`api/ProductReview/product/${productId}`, { query: { page: 1, pageSize: 100 } }),
        api(`api/ProductQuestion/product/${productId}`, { query: { page: 1, pageSize: 100 } }),
      ]);
      setReviews(unwrapList(reviewResponse)); setQuestions(unwrapList(questionResponse));
    } catch (cause: any) { show(cause.message, 'error'); }
    finally { setLoading(false); }
  };
  return <>
    <div className="page-head"><div><div className="eyebrow">محتوا</div><h1>نظرات و پرسش‌ها</h1><p>محصول را با نام یا کد جست‌وجو کنید تا بازخوردهای مربوط به همان محصول نمایش داده شود.</p></div></div>
    <div className="card permissions-head"><label><span>محصول</span><ProductReferenceField value={productId} required onChange={setProductId}/></label><button className="primary" type="button" onClick={() => void load()} disabled={!productId || loading}>{loading ? 'دریافت...' : 'نمایش بازخورد'}</button></div>
    {loading ? <div className="loading card"><i/><span>در حال دریافت بازخورد محصول...</span></div> : <div className="two-col"><div className="card simple-list"><h3>نظرات ({reviews.length.toLocaleString('fa-IR')})</h3>{reviews.length ? reviews.map((item, index) => <article key={pick(item, 'productReviewId', 'reviewId') ?? index}><b>{pick(item, 'userName', 'title') ?? `نظر ${index + 1}`}</b><p>{pick(item, 'comment', 'reviewText', 'text') ?? JSON.stringify(item)}</p></article>) : <div className="empty small">{hasLoaded ? 'برای این محصول نظری ثبت نشده است.' : 'ابتدا محصول را انتخاب کنید.'}</div>}</div><div className="card simple-list"><h3>پرسش‌ها ({questions.length.toLocaleString('fa-IR')})</h3>{questions.length ? questions.map((item, index) => <article key={pick(item, 'productQuestionId', 'questionId') ?? index}><b>{pick(item, 'userName', 'title') ?? `پرسش ${index + 1}`}</b><p>{pick(item, 'questionText', 'question', 'text') ?? JSON.stringify(item)}</p></article>) : <div className="empty small">{hasLoaded ? 'برای این محصول پرسشی ثبت نشده است.' : 'ابتدا محصول را انتخاب کنید.'}</div>}</div></div>}
  </>;
}
// Test
