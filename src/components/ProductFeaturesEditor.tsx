'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { api, unwrapList } from '@/lib/api';
import { useToast } from './Toast';

type Feature = { featureDefinitionId: number; name: string; dataType: string; unit?: string; isActive?: boolean };
type CategoryFeature = { featureId: number; isActive?: boolean };
type Option = { featureOptionId: number; featureId: number; name: string };
type Value = { featureValueId?: number; tempKey?: string; featureId: number; featureName?: string; valueString: string; valueNumeric?: number | null; valueBoolean?: boolean | null; optionId?: number | null; optionName?: string; isActive: boolean };
const numberId = (value: unknown) => Number(value) || 0;
const unwrapRecord = (value: any) => {
  let current = value;
  for (let depth = 0; depth < 4 && current && typeof current === 'object'; depth += 1) {
    const next = current.data ?? current.Data ?? current.mainResults ?? current.MainResults;
    if (!next || typeof next !== 'object') break;
    current = next;
  }
  return current;
};

export function ProductFeaturesEditor({ productId }: { productId: number }) {
  const { show } = useToast();
  const [brandName, setBrandName] = useState('');
  const [definitions, setDefinitions] = useState<Feature[]>([]);
  const [categoryFeatureIds, setCategoryFeatureIds] = useState<number[] | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [values, setValues] = useState<Value[]>([]);
  const [featureId, setFeatureId] = useState(0);
  const [text, setText] = useState('');
  const [bool, setBool] = useState(false);
  const [optionId, setOptionId] = useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const [editingId, setEditingId] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [catalogWarning, setCatalogWarning] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const productResult = await api(`api/Product/${productId}`);
      const product = unwrapRecord(productResult);
      setBrandName(String(product?.brandName ?? product?.BrandName ?? 'ثبت نشده'));
      const categoryId = numberId(product?.categoryId ?? product?.CategoryId);
      const [definitionsResult, optionsResult, valuesResult, categoryFeaturesResult] = await Promise.allSettled([
        api('api/FeatureDefinition'),
        api('api/FeatureOption'),
        api(`api/FeatureValue/product/${productId}`),
        categoryId ? api(`api/CategoryFeature/for-category/${categoryId}`) : Promise.resolve(null),
      ]);
      const catalogIssues: string[] = [];
      if (definitionsResult.status === 'fulfilled') setDefinitions(unwrapList(definitionsResult.value));
      else catalogIssues.push('تعریف ویژگی‌ها');
      if (optionsResult.status === 'fulfilled') setOptions(unwrapList(optionsResult.value));
      else catalogIssues.push('گزینه‌های ویژگی');
      if (categoryFeaturesResult.status === 'fulfilled' && categoryId) {
        setCategoryFeatureIds(unwrapList(categoryFeaturesResult.value)
          .filter((link: CategoryFeature) => link.isActive !== false)
          .map((link: CategoryFeature) => numberId(link.featureId))
          .filter(Boolean));
      } else {
        setCategoryFeatureIds(null);
        if (!categoryId) catalogIssues.push('دسته‌بندی محصول');
        else catalogIssues.push('ویژگی‌های متصل به دسته');
      }
      setCatalogWarning(catalogIssues.length ? `بارگذاری ${catalogIssues.join(' و ')} با مشکل روبه‌رو شد؛ مقادیر ثبت‌شده همچنان نمایش داده می‌شوند.` : '');
      if (valuesResult.status === 'rejected') throw valuesResult.reason;
      setValues(unwrapList(valuesResult.value));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'دریافت ویژگی‌ها ناموفق بود.');
    } finally { setLoading(false); }
  }, [productId]);
  useEffect(() => { void load(); }, [load]);

  const selected = definitions.find((definition) => numberId(definition.featureDefinitionId) === featureId);
  const availableDefinitions = definitions.filter((definition) => definition.name.trim() !== 'برند' || numberId(definition.featureDefinitionId) === featureId);
  const kind = String(selected?.dataType ?? 'Text').toLowerCase();
  const choices = useMemo(() => options.filter((option) => numberId(option.featureId) === featureId), [options, featureId]);
  const reset = () => { setFeatureId(0); setText(''); setBool(false); setOptionId(0); setSelectedOptionIds([]); setEditingId(0); };
  const beginEdit = (value: Value) => {
    const definition = definitions.find((item) => numberId(item.featureDefinitionId) === numberId(value.featureId));
    const multi = String(definition?.dataType).toLowerCase() === 'multiselect';
    setEditingId(multi ? 0 : numberId(value.featureValueId));
    setFeatureId(numberId(value.featureId));
    setSelectedOptionIds(multi ? values.filter((item) => numberId(item.featureId) === numberId(value.featureId)).map((item) => numberId(item.optionId)).filter(Boolean) : []);
    setText(value.valueNumeric != null ? String(value.valueNumeric) : value.valueString ?? '');
    setBool(!!value.valueBoolean);
    setOptionId(numberId(value.optionId));
  };
  const save = async () => {
    if (!selected) { show('ابتدا ویژگی را انتخاب کنید.', 'error'); return; }
    if (kind === 'number' && (text.trim() === '' || !Number.isFinite(Number(text)))) { show('مقدار عددی معتبر وارد کنید.', 'error'); return; }
    if (kind === 'select' && !optionId) { show('یک گزینه انتخاب کنید.', 'error'); return; }
    if (kind === 'multiselect' && !selectedOptionIds.length) { show('دست‌کم یک گزینه انتخاب کنید.', 'error'); return; }
    if (!['number', 'boolean', 'select', 'multiselect'].includes(kind) && !text.trim()) { show('مقدار ویژگی را وارد کنید.', 'error'); return; }
    const pickedOption = choices.find((option) => numberId(option.featureOptionId) === optionId);
    const payload = {
      valueString: kind === 'boolean' ? (bool ? 'بله' : 'خیر') : kind === 'number' ? text.trim() : pickedOption?.name ?? text.trim(),
      valueNumeric: kind === 'number' ? Number(text) : null,
      valueBoolean: kind === 'boolean' ? bool : null,
      optionId: kind === 'select' || kind === 'multiselect' ? optionId : null,
    };
    setBusy(true);
    try {
      if (kind === 'multiselect') {
        const existing = values.filter((item) => numberId(item.featureId) === featureId);
        const keep = new Set(selectedOptionIds);
        const previous = new Set(existing.map((item) => numberId(item.optionId)));
        for (const item of existing.filter((entry) => !keep.has(numberId(entry.optionId)))) {
          await api(`api/FeatureValue/${item.featureValueId}`, { method: 'DELETE' });
        }
        for (const id of selectedOptionIds.filter((entry) => !previous.has(entry))) {
          const option = choices.find((entry) => numberId(entry.featureOptionId) === id);
          await api('api/FeatureValue', { method: 'POST', body: { productId, featureId, optionId: id, valueString: option?.name ?? '' } });
        }
      } else if (editingId) {
        await api(`api/FeatureValue/${editingId}`, { method: 'PUT', body: { ...payload, featureValueId: editingId, isActive: true } });
      } else {
        await api('api/FeatureValue', { method: 'POST', body: { ...payload, productId, featureId } });
      }
      if (kind === 'multiselect') {
        const existingIds = new Set(values.filter((item) => numberId(item.featureId) === featureId).map((item) => numberId(item.optionId)));
        const added = selectedOptionIds.filter((id) => !existingIds.has(id)).map((id) => {
          const option = choices.find((item) => numberId(item.featureOptionId) === id);
          return { ...payload, featureId, featureName: selected.name, optionId: id, optionName: option?.name, valueString: option?.name ?? '', isActive: true, tempKey: `new-${id}-${Date.now()}` };
        });
        const kept = values.filter((item) => numberId(item.featureId) === featureId && selectedOptionIds.includes(numberId(item.optionId)));
        setValues((current) => [...current.filter((item) => numberId(item.featureId) !== featureId), ...kept, ...added]);
      } else if (editingId) {
        setValues((current) => current.map((item) => numberId(item.featureValueId) === editingId ? { ...item, ...payload, featureName: selected.name, optionName: pickedOption?.name } : item));
      } else {
        setValues((current) => [...current, { ...payload, featureId, featureName: selected.name, optionName: pickedOption?.name, isActive: true, tempKey: `new-${featureId}-${Date.now()}` }]);
      }
      show(editingId || kind === 'multiselect' ? 'مقدار ویژگی ذخیره شد.' : 'ویژگی به محصول اضافه شد.');
      reset(); await load();
    } catch (cause) { show(cause instanceof Error ? cause.message : 'ثبت ویژگی ناموفق بود.', 'error'); }
    finally { setBusy(false); }
  };
  const remove = async (value: Value) => {
    if (!window.confirm(`ویژگی «${value.featureName ?? value.featureId}» حذف شود؟`)) return;
    setBusy(true);
    try { await api(`api/FeatureValue/${value.featureValueId}`, { method: 'DELETE' }); show('ویژگی حذف شد.'); if (editingId === value.featureValueId) reset(); await load(); }
    catch (cause) { show(cause instanceof Error ? cause.message : 'حذف ویژگی ناموفق بود.', 'error'); }
    finally { setBusy(false); }
  };

  return <section className="product-features form-section" aria-label="ویژگی‌های محصول">
    <div className="form-section-heading"><div><b>ویژگی‌های محصول</b><span>مقدار هر ویژگی را جداگانه ذخیره کنید.</span></div><button type="button" className="ghost" onClick={() => void load()} disabled={loading || busy} aria-label="بازخوانی ویژگی‌ها"><RefreshCw size={15} /></button></div>
    {error && <div className="feature-error">{error}<button type="button" onClick={() => void load()}>تلاش دوباره</button></div>}
    {catalogWarning && <div className="feature-warning" role="status">{catalogWarning}</div>}
    {loading ? <p className="feature-muted">در حال دریافت ویژگی‌ها...</p> : <>
      <div className="feature-value-row"><div><strong>برند</strong><span>{brandName || 'ثبت نشده'}</span></div><small>از بخش اطلاعات محصول ویرایش می‌شود.</small></div>
      <div className="feature-value-list">{values.length ? values.map((value, index) => <div className="feature-value-row" key={value.featureValueId ?? value.tempKey ?? index}><div><strong>{value.featureName ?? definitions.find((item) => item.featureDefinitionId === value.featureId)?.name ?? `ویژگی ${value.featureId}`}</strong><span>{value.optionName ?? (value.valueBoolean != null ? (value.valueBoolean ? 'بله' : 'خیر') : value.valueNumeric ?? value.valueString) ?? '—'}</span></div><button type="button" onClick={() => beginEdit(value)} disabled={busy || !value.featureValueId}>ویرایش</button><button type="button" className="danger-link" onClick={() => void remove(value)} disabled={busy || !value.featureValueId} aria-label="حذف ویژگی"><Trash2 size={15} /></button></div>) : <p className="feature-muted">هنوز ویژگی‌ای برای این محصول ثبت نشده است.</p>}</div>
      <div className="feature-editor-grid"><label><span>ویژگی دسته یا محصول</span><select value={featureId || ''} disabled={!!editingId || availableDefinitions.length === 0} onChange={(event) => { setFeatureId(Number(event.target.value)); setText(''); setOptionId(0); setSelectedOptionIds([]); }}><option value="">انتخاب ویژگی</option>{availableDefinitions.filter((item) => item.isActive !== false || item.featureDefinitionId === featureId).map((item) => <option key={item.featureDefinitionId} value={item.featureDefinitionId}>{item.name}{categoryFeatureIds?.includes(numberId(item.featureDefinitionId)) ? ' — ویژگی دسته' : ' — ویژگی محصول'}{item.unit ? ` (${item.unit})` : ''}</option>)}</select>{categoryFeatureIds !== null && availableDefinitions.length === 0 && <small>برای دسته این محصول هنوز ویژگی‌ای متصل نشده است. ابتدا از بخش «ویژگی‌های دسته» ویژگی اضافه کنید.</small>}</label>
        {selected && (kind === 'multiselect' ? <fieldset className="feature-multi-options"><legend>گزینه‌ها</legend>{choices.map((option) => <label key={option.featureOptionId}><input type="checkbox" checked={selectedOptionIds.includes(numberId(option.featureOptionId))} onChange={(event) => setSelectedOptionIds((current) => event.target.checked ? [...current, numberId(option.featureOptionId)] : current.filter((id) => id !== numberId(option.featureOptionId)))} /><span>{option.name}</span></label>)}{!choices.length && <span>برای این ویژگی هنوز گزینه‌ای تعریف نشده است.</span>}</fieldset> : kind === 'select' ? <label><span>گزینه</span><select value={optionId || ''} onChange={(event) => setOptionId(Number(event.target.value))}><option value="">انتخاب گزینه</option>{choices.map((option) => <option key={option.featureOptionId} value={option.featureOptionId}>{option.name}</option>)}</select></label> : kind === 'boolean' ? <label className="feature-boolean"><input type="checkbox" checked={bool} onChange={(event) => setBool(event.target.checked)} /><span>بله / فعال</span></label> : <label><span>مقدار {kind === 'number' ? 'عددی' : 'متنی'}</span><input type={kind === 'number' ? 'number' : 'text'} step={kind === 'number' ? 'any' : undefined} value={text} onChange={(event) => setText(event.target.value)} /></label>)}
      </div><div className="feature-editor-actions">{editingId > 0 && <button type="button" className="ghost" onClick={reset}>لغو ویرایش</button>}<button type="button" className="primary" disabled={busy || !featureId} onClick={() => void save()}><Plus size={15} /> {busy ? 'در حال ذخیره...' : editingId ? 'ذخیره مقدار' : 'افزودن ویژگی'}</button></div>
    </>}
  </section>;
}
