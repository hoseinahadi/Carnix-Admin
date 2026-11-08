'use client';

import Link from 'next/link';
import { FileImage, Images, PlaySquare, Rotate3D } from 'lucide-react';
import { resources } from '@/lib/resources';
import { ResourceManager } from './ResourceManager';

const sections = [
  { key: 'images', label: 'تصاویر', hint: 'گالری، تصویر اصلی و متن جایگزین', icon: Images },
  { key: 'media', label: 'فایل و رسانه', hint: 'رسانه‌های متصل به محصول یا SKU', icon: FileImage },
  { key: 'videos', label: 'ویدیوها', hint: 'معرفی، آموزش و نصب محصول', icon: PlaySquare },
  { key: 'views360', label: 'نمای ۳۶۰ درجه', hint: 'منابع نمایش تعاملی محصول', icon: Rotate3D },
] as const;

export function ProductAssetsWorkspace({ section }: { section: string }) {
  const selected = sections.some(item => item.key === section) ? section : 'images';
  const config = resources[selected];
  return <>
    <nav className="asset-workspace-nav" aria-label="رسانه‌های محصول">
      <div><b>رسانه‌های محصول</b><small>همهٔ فایل‌های دیداری محصول در یک فضای کاری</small></div>
      {sections.map(({ key, label, hint, icon: Icon }) => <Link key={key} href={`/admin/${key}`} className={selected === key ? 'active' : ''} aria-current={selected === key ? 'page' : undefined}><Icon size={18}/><span><b>{label}</b><small>{hint}</small></span></Link>)}
    </nav>
    <ResourceManager key={selected} config={config}/>
  </>;
}
