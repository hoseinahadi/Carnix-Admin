'use client';

import Link from 'next/link';
import { BadgePercent, Boxes, Megaphone } from 'lucide-react';
import { resources } from '@/lib/resources';
import { ResourceManager } from './ResourceManager';

type CampaignSection = 'productDiscounts' | 'bundles';

export function CampaignWorkspace({ section }: { section: CampaignSection }) {
  return <>
    <nav className="campaign-workspace-nav" aria-label="کمپین‌های فروش">
      <div className="campaign-workspace-title"><span><Megaphone/></span><div><b>کمپین‌های فروش</b><small>تخفیف و بسته‌های پیشنهادی را از یک نقطه مدیریت کنید.</small></div></div>
      <Link href="/admin/productDiscounts" className={section === 'productDiscounts' ? 'active' : ''} aria-current={section === 'productDiscounts' ? 'page' : undefined}><BadgePercent/><span><b>تخفیف محصولات</b><small>درصد، مبلغ، زمان‌بندی و محدودیت</small></span></Link>
      <Link href="/admin/bundles" className={section === 'bundles' ? 'active' : ''} aria-current={section === 'bundles' ? 'page' : undefined}><Boxes/><span><b>بسته‌های فروش</b><small>ترکیب چند محصول در یک پیشنهاد</small></span></Link>
    </nav>
    <ResourceManager key={section} config={resources[section]}/>
  </>;
}
