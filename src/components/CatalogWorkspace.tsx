'use client';

import Link from 'next/link';
import { Boxes, FolderTree, Package, SlidersHorizontal, Tags } from 'lucide-react';
import { resources } from '@/lib/resources';
import { ResourceManager } from './ResourceManager';
import { WorkspaceNav } from './WorkspaceNav';

type CatalogSection = 'products' | 'categories' | 'brands' | 'features';
const items = [
  { key: 'products', label: 'محصولات', hint: 'کالا، قیمت و انتشار', icon: Package },
  { key: 'categories', label: 'دسته‌بندی‌ها', hint: 'ساختار درختی فروشگاه', icon: FolderTree },
  { key: 'brands', label: 'برندها', hint: 'سازنده و هویت برند', icon: Tags },
  { key: 'features', label: 'ویژگی‌ها', hint: 'مشخصات فنی و فیلتر', icon: SlidersHorizontal },
] as const;

export function CatalogWorkspace({ section }: { section: CatalogSection }) {
  return <>
    <nav className="catalog-workspace-nav" aria-label="مرکز کاتالوگ">
      <div><span><Boxes/></span><section><b>مرکز کاتالوگ</b><small>ساختار و اطلاعات اصلی کالاها را یک‌جا مدیریت کنید.</small></section></div>
      <div className="catalog-workspace-links">{items.map(({ key, label, hint, icon: Icon }) => <Link key={key} href={`/admin/${key}`} className={section === key ? 'active' : ''} aria-current={section === key ? 'page' : undefined}><Icon/><span><b>{label}</b><small>{hint}</small></span></Link>)}</div>
    </nav>
    <WorkspaceNav section={section}/>
    <ResourceManager key={section} config={resources[section]}/>
  </>;
}
