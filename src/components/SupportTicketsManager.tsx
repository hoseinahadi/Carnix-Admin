'use client';

import { useCallback, useEffect, useState } from 'react';
import { Headphones, RefreshCw, Send, X } from 'lucide-react';
import { api, unwrapData } from '@/lib/api';
import { useToast } from './Toast';

const get = (source: any, key: string) => {
  if (!source || typeof source !== 'object') return undefined;
  if (source[key] !== undefined) return source[key];
  const match = Object.keys(source).find(item => item.toLowerCase() === key.toLowerCase());
  return match ? source[match] : undefined;
};
const date = (value: unknown) => value ? new Date(String(value)).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
const statusLabel = (value: unknown) => value === 'answered' ? 'پاسخ داده‌شده' : value === 'closed' ? 'بسته' : 'باز';

export function SupportTicketsManager() {
  const { show } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [status, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = unwrapData(await api('api/admin/operations/tickets', { query: { page, pageSize, status, search: appliedSearch } }));
      setTickets(get(result, 'items') || []);
      setTotalCount(Number(get(result, 'totalCount') || 0));
    } catch (cause) { show(cause instanceof Error ? cause.message : 'دریافت تیکت‌ها انجام نشد.', 'error'); }
    finally { setLoading(false); }
  }, [appliedSearch, page, show, status]);
  useEffect(() => { void load(); }, [load]);
  const applyFilters = () => {
    const nextSearch = search.trim();
    if (page === 1 && nextSearch === appliedSearch) void load();
    else {
      setPage(1);
      setAppliedSearch(nextSearch);
    }
  };

  const open = async (id: number) => {
    try { setSelected(unwrapData(await api(`api/admin/operations/tickets/${id}`))); setReply(''); }
    catch (cause) { show(cause instanceof Error ? cause.message : 'دریافت تیکت انجام نشد.', 'error'); }
  };
  const setStatus = async (status: string) => {
    if (!selected || busy) return;
    setBusy(true);
    try { await api(`api/admin/operations/tickets/${get(selected, 'customerTicketId')}/status`, { method: 'PATCH', body: { status } }); await open(Number(get(selected, 'customerTicketId'))); await load(); show('وضعیت تیکت تغییر کرد.'); }
    catch (cause) { show(cause instanceof Error ? cause.message : 'تغییر وضعیت انجام نشد.', 'error'); }
    finally { setBusy(false); }
  };
  const send = async () => {
    if (!selected || !reply.trim() || busy) return;
    setBusy(true);
    try { await api(`api/admin/operations/tickets/${get(selected, 'customerTicketId')}/replies`, { method: 'POST', body: { body: reply.trim() } }); setReply(''); await open(Number(get(selected, 'customerTicketId'))); await load(); show('پاسخ ارسال شد.'); }
    catch (cause) { show(cause instanceof Error ? cause.message : 'ارسال پاسخ انجام نشد.', 'error'); }
    finally { setBusy(false); }
  };

  return <><div className="page-head"><div><div className="eyebrow">پشتیبانی</div><h1>مدیریت تیکت‌ها</h1><p>مشاهده گفت‌وگو، پاسخ پشتیبانی و کنترل وضعیت درخواست‌های کاربران.</p></div><button className="ghost" type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={16} />بروزرسانی</button></div>
    <div className="toolbar"><div className="searchbox"><span>⌕</span><input value={search} onChange={event => setSearch(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') applyFilters(); }} placeholder="موضوع، متن، دسته، شناسه تیکت یا کاربر" /></div><select className="select-filter" value={status} onChange={event => { setStatusFilter(event.target.value); setPage(1); }}><option value="">همه وضعیت‌ها</option><option value="open">باز</option><option value="answered">پاسخ داده‌شده</option><option value="closed">بسته</option></select><button className="primary" type="button" onClick={applyFilters}>اعمال فیلتر</button></div>
    <div className="card table-card">{loading ? <div className="loading"><i /></div> : <div className="table-wrap"><table><thead><tr><th>شناسه</th><th>کاربر</th><th>موضوع</th><th>دسته</th><th>وضعیت</th><th>پاسخ‌ها</th><th>آخرین فعالیت</th><th>عملیات</th></tr></thead><tbody>{tickets.map(ticket => <tr key={get(ticket, 'customerTicketId')}><td>{get(ticket, 'customerTicketId')}</td><td>{get(ticket, 'userId')}</td><td>{get(ticket, 'subject')}</td><td>{get(ticket, 'category')}</td><td><span className="badge info">{statusLabel(get(ticket, 'status'))}</span></td><td>{Number(get(ticket, 'replyCount') || 0).toLocaleString('fa-IR')}</td><td>{date(get(ticket, 'updatedAt') || get(ticket, 'createdAt'))}</td><td><button className="table-button" onClick={() => void open(Number(get(ticket, 'customerTicketId')))}>مشاهده و پاسخ</button></td></tr>)}</tbody></table>{!tickets.length && <div className="empty">تیکتی ثبت نشده است.</div>}</div>}</div>
    {totalCount > pageSize && <div className="pagination"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage(value => Math.max(1, value - 1))}>قبلی</button><span>صفحه {page.toLocaleString('fa-IR')} از {Math.ceil(totalCount / pageSize).toLocaleString('fa-IR')}</span><button type="button" disabled={page * pageSize >= totalCount || loading} onClick={() => setPage(value => value + 1)}>بعدی</button></div>}
    {selected && <div className="drawer-layer" role="presentation" onMouseDown={() => setSelected(null)}><aside className="drawer ticket-drawer" role="dialog" aria-modal="true" aria-labelledby="support-ticket-title" onMouseDown={event => event.stopPropagation()}><header><div><b id="support-ticket-title">{get(selected, 'subject')}</b><span>تیکت #{get(selected, 'customerTicketId')} · کاربر {get(selected, 'userId')}</span></div><button type="button" aria-label="بستن" onClick={() => setSelected(null)}><X size={18} /></button></header><div className="ticket-drawer-content"><div className="ticket-toolbar"><Headphones size={18} /><select value={get(selected, 'status')} disabled={busy} onChange={event => void setStatus(event.target.value)}><option value="open">باز</option><option value="answered">پاسخ داده‌شده</option><option value="closed">بسته</option></select></div><div className="ticket-conversation"><article data-support="false"><b>کاربر</b><time>{date(get(selected, 'createdAt'))}</time><p>{get(selected, 'message')}</p></article>{(get(selected, 'replies') || []).map((item: any) => <article key={get(item, 'customerTicketReplyId')} data-support={String(Boolean(get(item, 'isFromSupport')))}><b>{get(item, 'isFromSupport') ? 'پشتیبانی' : 'کاربر'}</b><time>{date(get(item, 'createdAt'))}</time><p>{get(item, 'body')}</p></article>)}</div>{get(selected, 'status') !== 'closed' && <div className="ticket-reply"><textarea rows={5} value={reply} disabled={busy} onChange={event => setReply(event.target.value)} placeholder="پاسخ پشتیبانی را بنویسید…"/><button className="primary" type="button" disabled={busy || !reply.trim()} onClick={() => void send()}><Send size={16} />ارسال پاسخ</button></div>}</div></aside></div>}
  </>;
}
