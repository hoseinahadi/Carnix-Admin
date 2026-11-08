'use client';

import Link from 'next/link';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { resources } from '@/lib/resources';
import { ResourceManager } from './ResourceManager';
import { Permissions } from './SpecialSections';

export function AccessWorkspace({ section }: { section: 'roles' | 'permissions' }) {
  return <>
    <nav className="access-workspace-nav" aria-label="مدیریت نقش و دسترسی">
      <div><b>نقش و دسترسی</b><small>ابتدا نقش را تعریف کنید، سپس مجوزهای آن را تنظیم کنید.</small></div>
      <Link href="/admin/roles" className={section === 'roles' ? 'active' : ''} aria-current={section === 'roles' ? 'step' : undefined}><span>۱</span><ShieldCheck/><div><b>تعریف نقش‌ها</b><small>عنوان، سطح و وضعیت نقش</small></div></Link>
      <i aria-hidden="true"/>
      <Link href="/admin/permissions" className={section === 'permissions' ? 'active' : ''} aria-current={section === 'permissions' ? 'step' : undefined}><span>۲</span><KeyRound/><div><b>تنظیم دسترسی‌ها</b><small>انتخاب عملیات مجاز برای نقش</small></div></Link>
    </nav>
    {section === 'roles' ? <ResourceManager config={resources.roles}/> : <Permissions/>}
  </>;
}
