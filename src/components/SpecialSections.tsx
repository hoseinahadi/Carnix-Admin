'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, MessageCircle, RotateCcw, Search, Send, ShieldCheck, Star, UserRound } from 'lucide-react';
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

  useEffect(() => {
    const preventExit = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', preventExit);
    return () => window.removeEventListener('beforeunload', preventExit);
  }, [dirty]);

  const load = async (selectedRole = roleId) => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      const response = await api(`api/Permissions/GetProjectStructure/${selectedRole}`);
      const controllers = unwrapList(response) as Controller[];
      setTree(controllers.map((controller) => ({
        ...controller,
        actions: Array.from(new Map((controller.actions ?? []).map((action) => [action.projectActionId, action])).values()),
      })));
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
  const changeVisible = (allowed: boolean) => {
    const visibleIds = new Set(filtered.flatMap((controller) => controller.actions.map((action) => action.projectActionId)));
    setTree((current) => current.map((controller) => ({
      ...controller,
      actions: controller.actions.map((action) => visibleIds.has(action.projectActionId) ? { ...action, isAccess: allowed } : action),
    })));
    setDirty(true);
  };
  const selectRole = (nextRoleId: string) => {
    if (dirty && !window.confirm('تغییرات این نقش هنوز ذخیره نشده است. بدون ذخیره نقش را عوض می‌کنید؟')) return;
    setRoleId(nextRoleId);
    setTree([]);
    setQuery('');
    setDirty(false);
    if (nextRoleId) void load(nextRoleId);
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
  const allActions = useMemo(() => tree.flatMap((controller) => controller.actions), [tree]);
  const activeCount = useMemo(() => allActions.filter((action) => action.isAccess).length, [allActions]);
  const visibleActions = useMemo(() => filtered.flatMap((controller) => controller.actions), [filtered]);
  const visibleActiveCount = useMemo(() => visibleActions.filter((action) => action.isAccess).length, [visibleActions]);
  const selectedRole = roles.find((role) => String(pick(role, 'roleId', 'id')) === roleId);
  const selectedRoleName = selectedRole ? pick(selectedRole, 'displayName', 'roleName', 'name', 'title') : null;

  return <>
    <div className="page-head"><div><div className="eyebrow">کاربران و دسترسی</div><h1>سطوح دسترسی</h1><p>نقش را انتخاب کنید؛ دسترسی‌ها خودکار دریافت می‌شوند و می‌توانید یک بخش یا نتایج جست‌وجو را یکجا تغییر دهید.</p></div><button className="ghost permission-rescan" type="button" disabled={busy || loading} onClick={() => void rescan()}><RotateCcw size={16}/>همگام‌سازی ساختار</button></div>
    <section className="card permission-role-bar">
      <label><span>نقش موردنظر</span><select value={roleId} onChange={(event) => selectRole(event.target.value)}><option value="">یک نقش انتخاب کنید</option>{roles.map((role, index) => <option key={pick(role, 'roleId', 'id') ?? index} value={pick(role, 'roleId', 'id')}>{pick(role, 'displayName', 'roleName', 'name', 'title') ?? `نقش ${index + 1}`}</option>)}</select></label>
      <div className="permission-role-summary"><ShieldCheck size={22}/><div><b>{selectedRoleName ?? 'هنوز نقشی انتخاب نشده'}</b><span>{tree.length ? `${activeCount.toLocaleString('fa-IR')} دسترسی فعال از ${allActions.length.toLocaleString('fa-IR')}` : 'برای شروع، نقش را انتخاب کنید'}</span></div></div>
      {dirty && <div className="permission-unsaved"><AlertTriangle size={17}/><span>تغییرات ذخیره‌نشده دارید</span></div>}
      {tree.length > 0 && <button className="primary permission-save" type="button" disabled={!dirty || busy} onClick={() => void save()}>{busy ? 'در حال ذخیره…' : 'ذخیره دسترسی‌ها'}</button>}
    </section>
    {tree.length > 0 && <div className="permission-tools"><div className="searchbox"><Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی نام بخش، عملیات یا مسیر API" aria-label="جست‌وجوی مجوزها"/></div><div className="permission-visible-summary"><CheckCircle2 size={16}/><span>{visibleActiveCount.toLocaleString('fa-IR')} فعال از {visibleActions.length.toLocaleString('fa-IR')} نتیجه</span></div><div className="permission-bulk"><button type="button" onClick={() => changeVisible(true)} disabled={!visibleActions.length || visibleActiveCount === visibleActions.length}>فعال‌کردن نتایج</button><button type="button" onClick={() => changeVisible(false)} disabled={!visibleActiveCount}>غیرفعال‌کردن نتایج</button></div></div>}
    {loading ? <div className="loading card"><i/><span>در حال دریافت دسترسی‌های نقش…</span></div> : tree.length === 0 ? <div className="empty card"><ShieldCheck size={32}/><b>{roleId ? 'دسترسی‌ای برای این نقش پیدا نشد' : 'مدیریت دسترسی از انتخاب نقش شروع می‌شود'}</b><span>{roleId ? 'در صورت جدیدبودن APIها، ساختار سیستم را همگام‌سازی کنید.' : 'نقش را انتخاب کنید؛ نیازی به زدن دکمهٔ بارگذاری نیست.'}</span></div> : <div className="permission-controller-list">{filtered.map((controller) => { const active = controller.actions.filter((action) => action.isAccess).length; return <section className="card permission-controller" key={controller.projectControllerId}><header><div><b>{controller.controllerName}</b><span>{controller.moduleName ?? controller.areaName ?? 'عمومی'}</span><small>{active.toLocaleString('fa-IR')} فعال از {controller.actions.length.toLocaleString('fa-IR')}</small></div><label className="permission-switch"><input type="checkbox" checked={controller.actions.length > 0 && active === controller.actions.length} onChange={(event) => changeController(controller.projectControllerId, event.target.checked)}/><i/><span>دسترسی کامل بخش</span></label></header><div className="permission-action-list">{controller.actions.map((action) => { const title = String(action.description || action.actionName); const hasDistinctActionName = !!action.description && action.description.trim().toLocaleLowerCase() !== action.actionName.trim().toLocaleLowerCase(); return <label className={`permission-action ${action.isAccess ? 'allowed' : ''}`} key={action.projectActionId}><input type="checkbox" checked={!!action.isAccess} onChange={(event) => changeAction(action.projectActionId, event.target.checked)}/><span><b>{title}</b>{hasDistinctActionName && <small>{action.actionName}</small>}<span className="permission-action-meta"><em>{action.httpMethod}</em><details><summary>جزئیات API</summary><code dir="ltr">{action.route}</code></details></span></span>{action.isSensitive && <em className="permission-sensitive">حساس</em>}</label>; })}</div></section>; })}{filtered.length === 0 && <div className="empty card small">هیچ دسترسی‌ای با این عبارت پیدا نشد.</div>}</div>}
  </>;
}

export function Reviews() {
  const { show } = useToast();
  const [productId, setProductId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');
  const [answerBusy, setAnswerBusy] = useState(false);
  const load = async () => {
    if (!productId) return;
    setLoading(true); setHasLoaded(true);
    try {
      const [reviewResponse, questionResponse] = await Promise.all([
        api(`api/ProductReview/product/${productId}`, { query: { page: 1, pageSize: 100 } }),
        api(`api/ProductQuestion/product/${productId}`, { query: { page: 1, pageSize: 100 } }),
      ]);
      const reviewData = reviewResponse?.data ?? reviewResponse;
      const questionData = questionResponse?.data ?? questionResponse;
      setReviews(Array.isArray(reviewData?.reviews) ? reviewData.reviews : unwrapList(reviewResponse));
      setQuestions(Array.isArray(questionData?.questions) ? questionData.questions : unwrapList(questionResponse));
    } catch (cause: any) { show(cause.message, 'error'); }
    finally { setLoading(false); }
  };
  const sendAnswer = async () => {
    if (!answeringId || !answer.trim() || answerBusy) return;
    setAnswerBusy(true);
    try {
      await api(`api/ProductQuestion/answer/${answeringId}`, { method: 'POST', body: { answerText: answer.trim() } });
      show('پاسخ پرسش ثبت شد.');
      setAnswer(''); setAnsweringId(null);
      await load();
    } catch (cause: any) { show(cause.message || 'ثبت پاسخ انجام نشد.', 'error'); }
    finally { setAnswerBusy(false); }
  };
  const formatDate = (value: unknown) => value ? new Date(String(value)).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
  return <>
    <div className="page-head"><div><div className="eyebrow">محتوا</div><h1>نظرات و پرسش‌ها</h1><p>محصول را با نام یا کد جست‌وجو کنید؛ نظرها را بخوانید و بدون ترک صفحه به پرسش مشتری پاسخ دهید.</p></div></div>
    <div className="card permissions-head"><label><span>محصول</span><ProductReferenceField value={productId} required onChange={setProductId}/></label><button className="primary" type="button" onClick={() => void load()} disabled={!productId || loading}>{loading ? 'دریافت...' : 'نمایش بازخورد'}</button></div>
    {loading ? <div className="loading card"><i/><span>در حال دریافت بازخورد محصول...</span></div> : <div className="feedback-layout">
      <section className="card feedback-panel"><header><div><Star size={18}/><span><b>نظرات کاربران</b><small>تجربه خریداران از این محصول</small></span></div><strong>{reviews.length.toLocaleString('fa-IR')}</strong></header><div className="feedback-list">{reviews.length ? reviews.map((item, index) => <article className="feedback-card" key={pick(item, 'productReviewId', 'reviewId') ?? index}><div className="feedback-meta"><span><UserRound size={15}/><b>{pick(item, 'userName', 'title') ?? `کاربر ${index + 1}`}</b></span><time>{formatDate(pick(item, 'createdAt'))}</time></div>{Number(pick(item, 'rating')) > 0 && <div className="feedback-rating" aria-label={`امتیاز ${pick(item, 'rating')} از ۵`}>{Array.from({ length: 5 }, (_, star) => <Star size={14} key={star} fill={star < Number(pick(item, 'rating')) ? 'currentColor' : 'none'}/>)}</div>}<p>{pick(item, 'comment', 'reviewText', 'text') ?? 'متن نظری ثبت نشده است.'}</p></article>) : <div className="empty small">{hasLoaded ? 'برای این محصول نظری ثبت نشده است.' : 'ابتدا محصول را انتخاب کنید.'}</div>}</div></section>
      <section className="card feedback-panel"><header><div><MessageCircle size={18}/><span><b>پرسش و پاسخ</b><small>پاسخ‌گویی مستقیم به مشتری</small></span></div><strong>{questions.length.toLocaleString('fa-IR')}</strong></header><div className="feedback-list">{questions.length ? questions.map((item, index) => { const id = Number(pick(item, 'productQuestionId', 'questionId')); const answers = Array.isArray(pick(item, 'answers')) ? pick(item, 'answers') : []; return <article className="feedback-card question-card" key={id || index}><div className="feedback-meta"><span><UserRound size={15}/><b>{pick(item, 'userName') ?? `کاربر ${index + 1}`}</b></span><time>{formatDate(pick(item, 'createdAt'))}</time></div><p>{pick(item, 'questionText', 'question', 'text') ?? 'متن پرسش ثبت نشده است.'}</p>{answers.length > 0 && <div className="answer-list">{answers.map((row: any, answerIndex: number) => <div key={pick(row, 'questionAnswerId') ?? answerIndex}><b>{pick(row, 'isAdminReply') ? 'پشتیبانی' : pick(row, 'userName') || 'پاسخ'}</b><p>{pick(row, 'answerText')}</p></div>)}</div>}{answeringId === id ? <div className="answer-editor"><textarea rows={4} value={answer} onChange={event => setAnswer(event.target.value)} placeholder="پاسخ روشن و کامل برای مشتری بنویسید…"/><div><button type="button" className="ghost" disabled={answerBusy} onClick={() => { setAnsweringId(null); setAnswer(''); }}>انصراف</button><button type="button" className="primary" disabled={!answer.trim() || answerBusy} onClick={() => void sendAnswer()}><Send size={15}/>{answerBusy ? 'در حال ارسال…' : 'ثبت پاسخ'}</button></div></div> : <button type="button" className="question-answer-button" onClick={() => { setAnsweringId(id); setAnswer(''); }}><MessageCircle size={15}/>پاسخ به پرسش</button>}</article>; }) : <div className="empty small">{hasLoaded ? 'برای این محصول پرسشی ثبت نشده است.' : 'ابتدا محصول را انتخاب کنید.'}</div>}</div></section>
    </div>}
  </>;
}
// Test
