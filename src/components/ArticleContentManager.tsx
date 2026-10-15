'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, unwrapList } from '@/lib/api';
import { useToast } from './Toast';
import {CatalogDropdown} from './CatalogDropdown';

type EditorForm = {
  contentTypeId: string; contentTemplateId: string; title: string; body: string; slug: string;
  pageTitle: string; metaDescription: string; metaKeywords: string; canonicalUrl: string; blocks: string;
};
const emptyForm: EditorForm = { contentTypeId: '', contentTemplateId: '', title: '', body: '', slug: '', pageTitle: '', metaDescription: '', metaKeywords: '', canonicalUrl: '', blocks: '[]' };
const field = (obj: any, name: string) => obj?.[name] ?? obj?.[name[0].toUpperCase() + name.slice(1)];
const envelopeData = (value: any) => field(value, 'mainResults') ?? field(value, 'data') ?? field(value, 'result') ?? value;
const toForm = (value: any): EditorForm => {
  const seo = field(value, 'seoMetadata') || {};
  const blocks = field(value, 'blocks') || [];
  return {
    contentTypeId: String(field(value, 'contentTypeId') ?? ''), contentTemplateId: String(field(value, 'contentTemplateId') ?? ''),
    title: field(value, 'title') || '', body: field(value, 'body') || '', slug: field(seo, 'slug') || '',
    pageTitle: field(seo, 'pageTitle') || '', metaDescription: field(seo, 'metaDescription') || '',
    metaKeywords: field(seo, 'metaKeywords') || '', canonicalUrl: field(seo, 'canonicalUrl') || '',
    blocks: JSON.stringify(blocks, null, 2),
  };
};

export function ArticleContentManager() {
  const { show } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [types, setTypes] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [optionsError, setOptionsError] = useState('');
  const loadOptions = async () => { try { const result:any = await api('api/ContentManager/editor-options'); setTypes(result.types || []); setTemplates(result.templates || []); setOptionsError(''); } catch { setOptionsError('دریافت نوع محتوا و قالب ناموفق بود.'); } };
  useEffect(() => { void loadOptions(); }, []);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'article' | 'seo' | 'blocks'>('article');
  const [form, setForm] = useState<EditorForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState('');
  const [loadingEditor, setLoadingEditor] = useState(false);
  const [publishingId, setPublishingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true); setLoadError('');
    try { const response = await api('api/ContentManager/all', { query: { page, pageSize: 50, status } }); setRows(unwrapList(response)); setTotal(Number(field(envelopeData(response), 'totalCount') || 0)); }
    catch (error: any) { setLoadError(error.message || 'دریافت مقاله‌ها ناموفق بود.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [status, page]);

  const updateForm = (key: keyof EditorForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const closeEditor = () => { if (saving) return; setEditorOpen(false); setEditingId(null); setForm(emptyForm); setActiveTab('article'); };
  const startCreate = () => { setEditingId(null); setForm(emptyForm); setActiveTab('article'); setEditorOpen(true); };
  const startEdit = async (row: any) => {
    const id = Number(field(row, 'dynamicContentId') ?? field(row, 'id'));
    if (!Number.isInteger(id) || id <= 0) { show('شناسه مقاله معتبر نیست.', 'error'); return; }
    setEditingId(id); setSavedAt(''); setEditorOpen(true); setLoadingEditor(true); setActiveTab('article');
    try {
      const response = await api(`api/ContentManager/${id}`);
      const data = envelopeData(response);
      setForm(toForm(data));
    } catch (error: any) { show(error.message || 'دریافت اطلاعات مقاله ناموفق بود.', 'error'); setEditorOpen(false); setEditingId(null); }
    finally { setLoadingEditor(false); }
  };

  const save = async () => {
    if (!form.title.trim() || !form.body.trim() || !form.slug.trim()) {
      show('عنوان، متن مقاله و آدرس یکتا الزامی است.', 'error'); setActiveTab(!form.slug.trim() ? 'seo' : 'article'); return;
    }
    const typeId = Number(form.contentTypeId), templateId = Number(form.contentTemplateId);
    if (!Number.isInteger(typeId) || typeId <= 0 || !Number.isInteger(templateId) || templateId <= 0) {
      show('نوع محتوا و قالب مقاله را انتخاب کنید.', 'error'); setActiveTab('article'); return;
    }
    let blocks: any[];
    try { blocks = JSON.parse(form.blocks || '[]'); if (!Array.isArray(blocks)) throw new Error(); }
    catch { show('ساختار بلوک‌ها باید یک آرایه JSON معتبر باشد.', 'error'); setActiveTab('blocks'); return; }

    setSaving(true);
    const body = {
      contentTypeId: typeId, contentTemplateId: templateId, title: form.title.trim(), body: form.body,
      blocks, seoMetadata: { pageTitle: form.pageTitle.trim() || form.title.trim(), metaDescription: form.metaDescription,
        metaKeywords: form.metaKeywords, slug: form.slug.trim(), canonicalUrl: form.canonicalUrl.trim() },
    };
    try {
      if (editingId) {
        await api(`api/ContentManager/${editingId}`, { method: 'PUT', body });
        setSavedAt(new Date().toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})); show('تغییرات مقاله ذخیره شد.');
      } else {
        await api('api/ContentManager/CreateFullContent', { method: 'POST', body });
        show('مقاله به‌صورت پیش‌نویس ایجاد شد.');
      }
      if (!editingId) { setEditorOpen(false); setForm(emptyForm); } await load();
    } catch (error: any) { show(error.message || 'ذخیره مقاله انجام نشد.', 'error'); }
    finally { setSaving(false); }
  };

  const publish = async (row: any) => {
    const id = Number(field(row, 'dynamicContentId') ?? field(row, 'id'));
    setPublishingId(id);
    try { await api(`api/ContentManager/${id}/publish`, { method: 'PATCH' }); show('مقاله منتشر شد.'); await load(); }
    catch (error: any) { show(error.message || 'انتشار مقاله ناموفق بود.', 'error'); }
    finally { setPublishingId(null); }
  };
  const filteredArticles = rows.filter((row)=>String(field(row,'title') || '').includes(search.trim()));
  const tabTitle = useMemo(() => editingId ? 'ویرایش مقاله' : 'مقاله جدید', [editingId]);
  return <>
    <div className="page-head"><div><div className="eyebrow">محتوا</div><h1>مقالات مجله</h1><p>مقاله‌ها را ایجاد، ویرایش و منتشر کنید.</p></div><button className="primary" onClick={startCreate}>＋ مقاله جدید</button></div>
    <div className="toolbar"><div className="searchbox"><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="جست‌وجوی عنوان در این صفحه" aria-label="جست‌وجوی عنوان مقاله" /></div><select className="select-filter" value={status} onChange={(event) => {setStatus(event.target.value);setPage(1);}}><option value="">همه وضعیت‌ها</option><option value="Draft">پیش‌نویس</option><option value="Published">منتشرشده</option></select><button className="ghost" onClick={load} disabled={loading}>↻ بروزرسانی</button></div>
    <div className="article-library">{loading ? <div className="loading"><i/><span>دریافت مقاله‌ها...</span></div> : loadError ? <div className="error-state"><b>دریافت مقاله‌ها ناموفق بود</b><span>{loadError}</span><button onClick={()=>void load()}>تلاش مجدد</button></div> : filteredArticles.map((row,index)=>{const id=Number(field(row,'dynamicContentId') ?? field(row,'id'));const published=field(row,'status')==='Published';return <article key={id || index}><header><span className={`badge ${published?'ok':'info'}`}>{published?'منتشرشده':'پیش‌نویس'}</span><small>مقاله {id.toLocaleString('fa-IR')}</small></header><h2>{field(row,'title') || 'بدون عنوان'}</h2><p dir="auto">{field(row,'slug') || 'آدرس هنوز ثبت نشده است.'}</p><div className="article-library-meta"><span>{types.find((type)=>type.id===field(row,'contentTypeId'))?.name || 'محتوا'}</span><time>{field(row,'createdAt') ? new Date(field(row,'createdAt')).toLocaleDateString('fa-IR') : '—'}</time></div><footer><button className="primary" onClick={()=>void startEdit(row)}>ویرایش مقاله</button>{!published && <button className="ghost" disabled={publishingId===id} onClick={()=>void publish(row)}>{publishingId===id?'در حال انتشار…':'انتشار'}</button>}</footer></article>})}{!loading && !loadError && !filteredArticles.length && <div className="empty"><b>{search ? 'مقاله‌ای با این جست‌وجو پیدا نشد.' : 'مقاله‌ای ثبت نشده است.'}</b><span>{search ? 'عنوان دیگری جست‌وجو کنید.' : 'برای شروع، مقاله جدید ایجاد کنید.'}</span></div>}</div>
    {total>50 && <div className="pagination"><button disabled={page<=1} onClick={()=>setPage((current)=>current-1)}>قبلی</button><span>صفحه {page.toLocaleString('fa-IR')} از {Math.ceil(total/50).toLocaleString('fa-IR')}</span><button disabled={page*50>=total} onClick={()=>setPage((current)=>current+1)}>بعدی</button></div>}


    {editorOpen && <div className="modal-layer content-editor-layer" onMouseDown={closeEditor}><section className="modal content-editor-modal" role="dialog" aria-modal="true" aria-labelledby="content-editor-title" onMouseDown={(event) => event.stopPropagation()}>
      <header className="content-editor-header"><div><span className="content-editor-kicker">مدیریت مجله</span><h2 id="content-editor-title">{tabTitle}</h2><p>{editingId ? 'متن، اطلاعات سئو و بلوک‌های مقاله را ویرایش کنید.' : 'مقاله به‌صورت پیش‌نویس ذخیره می‌شود و بعداً قابل انتشار است.'}</p></div><button className="content-editor-close" aria-label="بستن" onClick={closeEditor} disabled={saving}>×</button></header>
      <nav className="content-editor-tabs" role="tablist" aria-label="بخش‌های فرم"><button type="button" role="tab" aria-selected={activeTab === 'article'} className={activeTab === 'article' ? 'active' : ''} onClick={() => setActiveTab('article')}><span>۱</span> متن مقاله</button><button type="button" role="tab" aria-selected={activeTab === 'seo'} className={activeTab === 'seo' ? 'active' : ''} onClick={() => setActiveTab('seo')}><span>۲</span> آدرس و سئو</button><button type="button" role="tab" aria-selected={activeTab === 'blocks'} className={activeTab === 'blocks' ? 'active' : ''} onClick={() => setActiveTab('blocks')}><span>۳</span> بلوک‌های پیشرفته</button></nav>
      <div className="content-editor-body">
        {loadingEditor ? <div className="content-editor-loading"><i/><span>در حال دریافت اطلاعات مقاله…</span></div> : <>
          {activeTab === 'article' && <div className="content-form-panel"><div className="content-form-intro"><b>محتوا و ساختار</b><span>فیلدهای ستاره‌دار برای ذخیره الزامی هستند.</span></div><div className="content-form-grid"><label><span>عنوان مقاله <b>*</b></span><input autoFocus value={form.title} onChange={(event) => updateForm('title', event.target.value)} placeholder="عنوان روشن و توصیفی وارد کنید" /></label><CatalogDropdown label="نوع محتوا *" value={form.contentTypeId} placeholder="انتخاب نوع محتوا" searchable options={types.map((type)=>({value:String(type.id),label:type.name + (types.filter((item)=>item.name===type.name).length>1 ? ` · ${type.id}` : '')}))} onChange={(value)=>{updateForm('contentTypeId',value);updateForm('contentTemplateId','');}} /><CatalogDropdown label="قالب مقاله *" value={form.contentTemplateId} placeholder="انتخاب قالب" searchable options={templates.filter((template)=>String(template.contentTypeId)===form.contentTypeId).map((template)=>({value:String(template.id),label:template.name}))} onChange={(value)=>updateForm('contentTemplateId',value)} />{optionsError && <div className="content-form-wide"><span>{optionsError}</span><button className="ghost" onClick={()=>void loadOptions()}>تلاش مجدد</button></div>}<label className="content-form-wide"><span>متن مقاله <b>*</b></span><textarea className="content-body-input" value={form.body} onChange={(event) => updateForm('body', event.target.value)} placeholder="متن مقاله را بنویسید…"/><small>{form.body.length.toLocaleString('fa-IR')} نویسه</small></label></div></div>}
          {activeTab === 'seo' && <div className="content-form-panel"><div className="content-form-intro"><b>آدرس و بهینه‌سازی جست‌وجو</b><span>Slug در آدرس صفحه استفاده می‌شود و باید یکتا باشد.</span></div><div className="content-form-grid"><label><span>آدرس مقاله (Slug) <b>*</b></span><input dir="ltr" value={form.slug} onChange={(event) => updateForm('slug', event.target.value)} placeholder="example-article"/><small>فقط آدرس یکتا را وارد کنید، بدون دامنه سایت.</small></label><label><span>عنوان صفحه</span><input value={form.pageTitle} onChange={(event) => updateForm('pageTitle', event.target.value)} placeholder={form.title || 'عنوانی که در نتایج جست‌وجو نمایش داده می‌شود'}/></label><label className="content-form-wide"><span>توضیحات متا</span><textarea rows={4} maxLength={320} value={form.metaDescription} onChange={(event) => updateForm('metaDescription', event.target.value)} placeholder="خلاصه‌ای کوتاه و دقیق برای نتیجه جست‌وجو"/><small>{form.metaDescription.length.toLocaleString('fa-IR')} از ۳۲۰ نویسه</small></label><label className="content-form-wide"><span>کلیدواژه‌ها</span><input value={form.metaKeywords} onChange={(event) => updateForm('metaKeywords', event.target.value)} placeholder="آموزش خودرو، نگهداری، قطعات"/></label><label className="content-form-wide"><span>آدرس canonical</span><input dir="ltr" value={form.canonicalUrl} onChange={(event) => updateForm('canonicalUrl', event.target.value)} placeholder="https://example.com/article"/></label></div></div>}
          {activeTab === 'blocks' && <div className="content-form-panel"><div className="content-form-intro"><b>بلوک‌های سفارشی</b><span>برای مقاله ساده این بخش را با آرایه خالی نگه دارید.</span></div><label className="content-blocks-field"><span>آرایه بلوک‌ها (JSON)</span><textarea dir="ltr" spellCheck={false} rows={16} value={form.blocks} onChange={(event) => updateForm('blocks', event.target.value)} placeholder={'[{"blockName":"section","blockContent":"...","orderIndex":0}]'}/><small>فرمت هر مورد: blockName، blockContent و orderIndex</small></label></div>}
        </>}
      </div>
      <footer className="content-editor-footer"><span aria-live="polite">{savedAt ? `آخرین ذخیره موفق: ${savedAt}` : editingId ? 'ذخیره، مقاله را در وضعیت فعلی نگه می‌دارد.' : 'مقاله پس از ایجاد به‌صورت پیش‌نویس باقی می‌ماند.'}</span><div><button className="ghost" onClick={closeEditor} disabled={saving}>انصراف</button><button className="primary" onClick={() => void save()} disabled={saving || loadingEditor}>{saving ? 'در حال ذخیره…' : editingId ? 'ذخیره و ادامه ویرایش' : 'ایجاد پیش‌نویس'}</button></div></footer>
    </section></div>}
  </>;
}
// Test
