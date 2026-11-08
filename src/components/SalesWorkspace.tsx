'use client';

import Link from 'next/link';
import { CircleDollarSign, Headphones, History, ListChecks, Package, ShoppingCart, Truck } from 'lucide-react';
import { resources } from '@/lib/resources';
import { OrdersManager } from './OperationsSections';
import { SupportTicketsManager } from './SupportTicketsManager';
import { ResourceManager } from './ResourceManager';
import { PriceHistoryWorkspace } from './PriceHistoryWorkspace';
import { CarrierAssignmentsWorkspace } from './CarrierAssignmentsWorkspace';

const items = [
  { key: 'orders', label: 'سفارش‌ها', hint: 'پردازش، ارسال و جزئیات', icon: Package },
  { key: 'carrierAssignments', label: 'پیگیری پیک', hint: 'پذیرش و رد دعوت‌ها', icon: Truck },
  { key: 'tickets', label: 'پشتیبانی', hint: 'گفت‌وگو با مشتری', icon: Headphones },
  { key: 'orderStatuses', label: 'چرخه وضعیت', hint: 'وضعیت‌های سفارش', icon: ListChecks },
  { key: 'carts', label: 'سبدها', hint: 'سبدهای فعال کاربران', icon: ShoppingCart },
  { key: 'priceHistory', label: 'سوابق قیمت', hint: 'تغییرات قیمت کالا', icon: History },
] as const;

type SalesSection = typeof items[number]['key'];

export function SalesWorkspace({ section }: { section: SalesSection }) {
  const resource = section === 'carrierAssignments' ? undefined : resources[section];
  return <>
    <nav className="sales-workspace-nav" aria-label="مرکز عملیات فروش">
      <div><span><CircleDollarSign/></span><section><b>مرکز عملیات فروش</b><small>سفارش، مشتری و سوابق مالی در یک فضای کاری</small></section></div>
      <div className="sales-workspace-links">{items.map(({ key, label, hint, icon: Icon }) => <Link key={key} href={`/admin/${key}`} className={section === key ? 'active' : ''} aria-current={section === key ? 'page' : undefined}><Icon size={17}/><span><b>{label}</b><small>{hint}</small></span></Link>)}</div>
    </nav>
    {section === 'orders' ? <OrdersManager/> : section === 'carrierAssignments' ? <CarrierAssignmentsWorkspace/> : section === 'tickets' ? <SupportTicketsManager/> : section === 'priceHistory' ? <PriceHistoryWorkspace/> : resource ? <ResourceManager key={section} config={resource}/> : null}
  </>;
}
