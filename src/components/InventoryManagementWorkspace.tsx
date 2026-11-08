'use client';

import Link from 'next/link';
import { Boxes, Warehouse } from 'lucide-react';
import { resources } from '@/lib/resources';
import { InventoryWorkspace } from './InventoryWorkspace';
import { ResourceManager } from './ResourceManager';

type InventorySection = 'inventory' | 'warehouses';

export function InventoryManagementWorkspace({ section }: { section: InventorySection }) {
  return <>
    <nav className="inventory-workspace-nav" aria-label="مرکز انبار">
      <div><span><Warehouse/></span><section><b>مرکز انبار</b><small>موجودی کالا و انبارهای مقصد را در یک جریان مدیریت کنید.</small></section></div>
      <Link href="/admin/inventory" className={section === 'inventory' ? 'active' : ''} aria-current={section === 'inventory' ? 'page' : undefined}><Boxes/><span><b>عملیات موجودی</b><small>اصلاح، انتقال، رزرو و آزادسازی</small></span></Link>
      <Link href="/admin/warehouses" className={section === 'warehouses' ? 'active' : ''} aria-current={section === 'warehouses' ? 'page' : undefined}><Warehouse/><span><b>تعریف انبارها</b><small>نام، موقعیت و وضعیت انبار</small></span></Link>
    </nav>
    {section === 'inventory' ? <InventoryWorkspace/> : <ResourceManager config={resources.warehouses}/>} 
  </>;
}
