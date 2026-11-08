'use client';

import Link from 'next/link';
import { FileText, MessageCircle, MessagesSquare } from 'lucide-react';
import { ArticleContentManager } from './ArticleContentManager';
import { Reviews } from './SpecialSections';

type ContentSection = 'contents' | 'reviews';

export function ContentWorkspace({ section }: { section: ContentSection }) {
  return <>
    <nav className="content-workspace-nav" aria-label="محتوا و تعامل مشتری">
      <div><span><MessagesSquare/></span><section><b>محتوا و تعامل مشتری</b><small>انتشار محتوا و پاسخ‌گویی به بازخورد کاربران در یک فضا</small></section></div>
      <Link href="/admin/contents" className={section === 'contents' ? 'active' : ''} aria-current={section === 'contents' ? 'page' : undefined}><FileText/><span><b>مقاله‌ها و محتوا</b><small>ساخت، ویرایش و انتشار</small></span></Link>
      <Link href="/admin/reviews" className={section === 'reviews' ? 'active' : ''} aria-current={section === 'reviews' ? 'page' : undefined}><MessageCircle/><span><b>نظر و پرسش</b><small>بررسی بازخورد و پاسخ مشتری</small></span></Link>
    </nav>
    {section === 'contents' ? <ArticleContentManager/> : <Reviews/>}
  </>;
}
