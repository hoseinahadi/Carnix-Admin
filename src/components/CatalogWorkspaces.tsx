'use client';

import { useEffect, useMemo, useState } from 'react';
import { Boxes, ChevronLeft, ChevronDown, FolderTree, PackagePlus, Search, Sparkles, Tag } from 'lucide-react';
import { api, unwrapData, unwrapList } from '@/lib/api';
import { useToast } from './Toast';

type Row = Record<string, any>;
type Category = { id:number; name:string; parentId:number|null; children:Category[]; raw:Row };
const get=(o:Row|undefined,k:string)=>{if(!o)return undefined;const hit=Object.keys(o).find(x=>x.toLowerCase()===k.toLowerCase());return hit?o[hit]:undefined};
const productId=(p:Row)=>Number(get(p,'productId')??get(p,'id'));
const productName=(p:Row)=>String(get(p,'productName')??get(p,'name')??`محصول ${productId(p)}`);
function toTree(items:any[]):Category[]{
 const flat:Category[]=[]; const walk=(nodes:any[],parentId:number|null)=>nodes.forEach(raw=>{const id=Number(get(raw,'categoryId')??get(raw,'id'));if(!id)return;const item={id,name:String(get(raw,'name')??get(raw,'title')??`دسته ${id}`),parentId:Number(get(raw,'parentCategoryId'))||parentId,children:[],raw};flat.push(item);const kids=get(raw,'subCategories')??get(raw,'children');if(Array.isArray(kids))walk(kids,id)});walk(items,null);
 const map=new Map(flat.map(x=>[x.id,x]));flat.forEach(x=>{if(x.parentId&&map.has(x.parentId))map.get(x.parentId)!.children.push(x)});return flat.filter(x=>!x.parentId||!map.has(x.parentId));
}
const descendants=(c:Category):Category[]=>[c,...c.children.flatMap(descendants)];
function Picker({rows,selected,setSelected,placeholder}:{rows:Row[];selected:Set<number>;setSelected:(v:Set<number>)=>void;placeholder:string}){const[q,setQ]=useState('');const visible=rows.filter(x=>productName(x).toLowerCase().includes(q.toLowerCase())||String(get(x,'productCode')??'').toLowerCase().includes(q.toLowerCase()));return <div className="entity-picker"><div className="entity-search"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={placeholder}/><span>{selected.size.toLocaleString('fa-IR')} انتخاب</span></div><div className="entity-grid">{visible.map(row=>{const id=productId(row);return <button type="button" className={selected.has(id)?'selected':''} onClick={()=>{const n=new Set(selected);n.has(id)?n.delete(id):n.add(id);setSelected(n)}} key={id}><span className="entity-check">{selected.has(id)?'✓':''}</span><div><b>{productName(row)}</b><small>{get(row,'productCode')??'بدون کد'} · {get(row,'categoryName')??'بدون دسته'}</small></div></button>})}</div></div>}
function TreeNode({node,active,onPick}:{node:Category;active:number|null;onPick:(c:Category)=>void}){const[open,setOpen]=useState(false);return <div className="tree-node"><div className={active===node.id?'tree-row active':'tree-row'}><button className="tree-expand" disabled={!node.children.length} onClick={()=>setOpen(!open)}>{node.children.length?(open?<ChevronDown/>:<ChevronLeft/>):<span/>}</button><button className="tree-label" onClick={()=>onPick(node)}><FolderTree size={17}/><span><b>{node.name}</b><small>{node.children.length?`${node.children.length.toLocaleString('fa-IR')} زیر‌دسته`:'بدون زیر‌دسته'}</small></span></button></div>{open&&node.children.length>0&&<div className="tree-children">{node.children.map(x=><TreeNode node={x} active={active} onPick={onPick} key={x.id}/>)}</div>}</div>}

export function CategoriesWorkspace(){const{show}=useToast();const[tree,setTree]=useState<Category[]>([]),[active,setActive]=useState<Category|null>(null),[products,setProducts]=useState<Row[]>([]),[query,setQuery]=useState(''),[page,setPage]=useState(1);useEffect(()=>{api('api/Category/menu').then(x=>setTree(toTree(unwrapList(x)))).catch(e=>show(e.message,'error'))},[]);const pick=async(c:Category)=>{setActive(c);const ids=[c,...c.children.flatMap(descendants)];const rs=await Promise.all(ids.map(x=>api(`api/Product/category/${x.id}`,{query:{page:1,pageSize:500}}).catch(()=>null)));setProducts(rs.flatMap(unwrapList));setPage(1)};const filtered=products.filter(p=>`${productName(p)} ${get(p,'productCode')??''}`.toLowerCase().includes(query.toLowerCase()));const shown=filtered.slice((page-1)*20,page*20);return <><div className="page-head"><h1>ساختار دسته‌بندی</h1></div><div className="catalog-workspace"><aside className="card category-tree">{tree.map(x=><TreeNode node={x} active={active?.id??null} onPick={pick} key={x.id}/>)}</aside><main className="card category-stage">{active&&<><h2>{active.name}</h2><div className="product-browser-toolbar"><div className="product-browser-search"><Search size={17}/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder="جست‌وجوی محصول..."/></div><span>{filtered.length} محصول</span></div><div className="product-cards">{shown.map(p=><article key={productId(p)}><Boxes/><b>{productName(p)}</b></article>)}</div>{Math.ceil(filtered.length/20)>1&&<div className="product-pagination"><button className="ghost" disabled={page===1} onClick={()=>setPage(page-1)}>قبلی</button><span>{page} از {Math.ceil(filtered.length/20)}</span><button className="ghost" disabled={page>=Math.ceil(filtered.length/20)} onClick={()=>setPage(page+1)}>بعدی</button></div>}</>}</main></div></>}
export function BundlesWorkspace(){
 const{show}=useToast();const[bundles,setBundles]=useState<Row[]>([]),[products,setProducts]=useState<Row[]>([]),[active,setActive]=useState<Row|null>(null),[chosen,setChosen]=useState<Set<number>>(new Set()),[open,setOpen]=useState(false),[busy,setBusy]=useState(false);const load=async()=>{try{const[b,p]=await Promise.all([api('api/product-bundles/get-all'),api('api/Product/GetAll',{query:{page:1,pageSize:500}})]);setBundles(unwrapList(b));setProducts(unwrapList(p))}catch(e:any){show(e.message,'error')}};useEffect(()=>{void load()},[]);const items=(b:Row)=>get(b,'items')??get(b,'bundleItems')??[];const manage=(b:Row)=>{setActive(b);setChosen(new Set(items(b).map((x:Row)=>Number(get(x,'productId')))));setOpen(true)};const save=async()=>{if(!active)return;setBusy(true);try{const bundleId=Number(get(active,'productBundleId'));const existing:Row[]=items(active);const current=new Set(existing.map(x=>Number(get(x,'productId'))));const add=products.filter(p=>chosen.has(productId(p))&&!current.has(productId(p)));const remove=existing.filter(x=>!chosen.has(Number(get(x,'productId'))));await Promise.all([...add.map(p=>api('api/product-bundle-items/create',{method:'POST',body:{productBundleItemId:0,productBundleId:bundleId,productId:productId(p),productSKUID:null,quantity:1,unitPriceAtCreation:Number(get(p,'basePrice')??0)}})),...remove.map(x=>api(`api/product-bundle-items/delete/${get(x,'productBundleItemId')}`,{method:'DELETE'}))]);show('محصولات باندل ذخیره شد.');setOpen(false);await load()}catch(e:any){show(e.message,'error')}finally{setBusy(false)}};return <><div className="page-head"><div><div className="eyebrow">فروش</div><h1>باندل‌های محصول</h1><p>محتوای هر باندل را ببینید و محصولات آن را گروهی انتخاب کنید.</p></div></div><div className="bundle-grid">{bundles.map(b=><article className="card bundle-card" key={get(b,'productBundleId')}><div className="bundle-icon"><Tag/></div><div><h3>{get(b,'title')}</h3><p>{get(b,'description')||'بدون توضیح'}</p></div><div className="bundle-products">{items(b).slice(0,4).map((x:Row)=><span key={get(x,'productBundleItemId')}>{get(x,'productName')??`محصول ${get(x,'productId')}`}</span>)}{!items(b).length&&<span>محصولی اضافه نشده</span>}</div><footer><b>{Number(get(b,'price')??0).toLocaleString('fa-IR')} ریال</b><button className="primary" onClick={()=>manage(b)}>مدیریت محصولات</button></footer></article>)}</div>{open&&active&&<div className="modal-layer" onMouseDown={()=>setOpen(false)}><div className="modal assignment-modal" onMouseDown={e=>e.stopPropagation()}><header><div><b>محصولات باندل</b><span>{get(active,'title')}</span></div><button onClick={()=>setOpen(false)}>×</button></header><Picker rows={products} selected={chosen} setSelected={setChosen} placeholder="جست‌وجوی محصول برای باندل..."/><footer><span>{chosen.size.toLocaleString('fa-IR')} محصول</span><button className="ghost" onClick={()=>setOpen(false)}>انصراف</button><button className="primary" disabled={busy} onClick={save}>{busy?'در حال ذخیره...':'ذخیره محصولات باندل'}</button></footer></div></div>}</>;
}
//TEStTTTTTTTTTTTTTTTTTTTT
export function BrandsWorkspace() {
  const { show } = useToast();
  const [brands, setBrands] = useState<Row[]>([]);
  const [active, setActive] = useState<Row | null>(null);
  const [products, setProducts] = useState<Row[]>([]);
  const [chosen, setChosen] = useState<Set<number>>(new Set());
  const [chosenRows, setChosenRows] = useState<Map<number, Row>>(new Map());
  const [keyword, setKeyword] = useState('');
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api('api/brands/get-all')
      .then((result) => setBrands(unwrapList(result)))
      .catch((error) => show(error.message, 'error'));
  }, [show]);

  const search = async () => {
    const term = keyword.trim();
    if (!term) { setProducts([]); return; }
    setSearching(true);
    try {
      const result = await api('api/Product/search', { query: { keyword: term, page: 1, pageSize: 50 } });
      setProducts(unwrapList(result));
    } catch (error: any) { show(error.message, 'error'); }
    finally { setSearching(false); }
  };

  const select = (next: Set<number>) => {
    setChosen(next);
    setChosenRows((current) => {
      const updated = new Map(current);
      for (const product of products) {
        const id = productId(product);
        if (next.has(id)) updated.set(id, product);
        else updated.delete(id);
      }
      return updated;
    });
  };

  const save = async () => {
    if (!active) return;
    const brandId = Number(get(active, 'brandId'));
    const targets = Array.from(chosenRows.values()).filter((product) => Number(get(product, 'brandId')) !== brandId);
    if (!targets.length) { show('محصول جدیدی برای اختصاص به برند انتخاب نشده است.', 'error'); return; }
    setBusy(true);
    try {
      for (const product of targets) {
        const id = productId(product);
        const detail = unwrapData(await api(`api/Product/${id}`));
        await api(`api/Product/${id}`, { method: 'PUT', body: {
          productId: id,
          productName: get(detail, 'productName'),
          productCode: get(detail, 'productCode'),
          shortDescription: get(detail, 'shortDescription') ?? '',
          fullDescription: get(detail, 'fullDescription') ?? '',
          basePrice: get(detail, 'basePrice') ?? 0,
          isActive: !!get(detail, 'isActive'),
          isFeatured: !!get(detail, 'isFeatured'),
          categoryId: get(detail, 'categoryId'),
          supplierId: get(detail, 'supplierId'),
          maxPurchaseQuantity: get(detail, 'maxPurchaseQuantity'),
          weight: get(detail, 'weight'),
          displayOrder: get(detail, 'displayOrder') ?? 0,
          brandId,
        } });
      }
      show(`${targets.length.toLocaleString('fa-IR')} محصول به برند اختصاص یافت.`);
      setActive(null); setProducts([]); setChosen(new Set()); setChosenRows(new Map());
    } catch (error: any) { show(error.message, 'error'); }
    finally { setBusy(false); }
  };

  return <>
    <div className="page-head"><div><div className="eyebrow">کاتالوگ</div><h1>برندها و محصولات</h1><p>نام یا کد محصول را جست‌وجو کنید و به برند دلخواه اختصاص دهید.</p></div></div>
    <div className="brand-grid">{brands.map((brand) => <article className="card brand-card" key={get(brand, 'brandId')}><div className="brand-avatar">{String(get(brand, 'name') ?? 'ب').slice(0, 1)}</div><div><h3>{get(brand, 'name')}</h3><p>{get(brand, 'countryOfOrigin') || 'کشور سازنده ثبت نشده'}</p></div><button className="primary" onClick={() => { setActive(brand); setKeyword(''); setProducts([]); setChosen(new Set()); setChosenRows(new Map()); }}>افزودن محصول</button></article>)}</div>
    {active && <div className="modal-layer" onMouseDown={() => !busy && setActive(null)}><div className="modal assignment-modal" onMouseDown={(event) => event.stopPropagation()}><header><div><b>افزودن محصول به برند {get(active, 'name')}</b><span>نام یا کد کالا را جست‌وجو کنید. نتیجه‌ها از کل کاتالوگ دریافت می‌شوند.</span></div><button onClick={() => setActive(null)} disabled={busy}>×</button></header><div className="entity-search"><Search size={16}/><input value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void search(); }} placeholder="نام یا کد محصول"/><button className="ghost" disabled={searching || !keyword.trim()} onClick={() => void search()}>{searching ? 'در حال جست‌وجو...' : 'جست‌وجو'}</button></div>{products.length ? <Picker rows={products} selected={chosen} setSelected={select} placeholder="فیلتر در نتایج..."/> : <div className="empty small">نام یا کد محصول را وارد کنید.</div>}<footer><span>{chosen.size.toLocaleString('fa-IR')} محصول انتخاب شده</span><button className="ghost" onClick={() => setActive(null)} disabled={busy}>انصراف</button><button className="primary" disabled={busy || !chosen.size} onClick={() => void save()}>{busy ? 'در حال ذخیره...' : 'ثبت محصولات برند'}</button></footer></div></div>}
  </>;
}
// Test
