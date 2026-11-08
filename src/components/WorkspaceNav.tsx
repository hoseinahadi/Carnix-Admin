'use client';

import Link from 'next/link';
import { Boxes, CarFront, CircleDollarSign, FileImage, FileText, Headphones, ListChecks, Package, Settings2, ShieldCheck, Tags, Truck, Users, Warehouse, type LucideIcon } from 'lucide-react';
import styles from './WorkspaceNav.module.scss';

type WorkspaceItem = { key: string; label: string; icon: LucideIcon };

const workspaces: WorkspaceItem[][] = [
  [
    { key: 'products', label: 'فهرست محصولات', icon: Package },
    { key: 'skus', label: 'تنوع و SKU', icon: Boxes },
    { key: 'images', label: 'رسانه‌های محصول', icon: FileImage },
    { key: 'warranties', label: 'گارانتی', icon: ShieldCheck },
    { key: 'productTools', label: 'ابزار محصول', icon: Settings2 },
  ],
  [
    { key: 'features', label: 'تعریف ویژگی', icon: Settings2 },
    { key: 'featureOptions', label: 'گزینه‌ها', icon: ListChecks },
    { key: 'featureValues', label: 'مقادیر محصولات', icon: Tags },
    { key: 'categoryFeatures', label: 'ویژگی دسته‌ها', icon: Boxes },
    { key: 'tags', label: 'تگ‌ها', icon: Tags },
  ],
  [
    { key: 'inventory', label: 'مرکز انبار', icon: Warehouse },
  ],
  [
    { key: 'users', label: 'حساب‌های کاربری', icon: Users },
    { key: 'roles', label: 'نقش و دسترسی', icon: ShieldCheck },
  ],
  [
    { key: 'contents', label: 'محتوا و تعامل', icon: FileText },
  ],
  [
    { key: 'vehiclesMakes', label: 'برند خودرو', icon: CarFront },
    { key: 'vehiclesModels', label: 'مدل خودرو', icon: CarFront },
  ],
  [
    { key: 'productDiscounts', label: 'کمپین‌های فروش', icon: CircleDollarSign },
  ],
  [
    { key: 'orders', label: 'فروش و پشتیبانی', icon: Package },
  ],
  [
    { key: 'shippingMethods', label: 'روش‌های ارسال', icon: Truck },
    { key: 'paymentMethods', label: 'روش‌های پرداخت', icon: CircleDollarSign },
  ],
];

export function WorkspaceNav({ section }: { section: string }) {
  const items = workspaces.find(group => group.some(item => item.key === section));
  if (!items) return null;
  return <nav className={styles.workspace} aria-label="ابزارهای فضای کاری">
    <span className={styles.label}>ابزارهای مرتبط</span>
    {items.map(({ key, label, icon: Icon }) => <Link
      key={key}
      href={`/admin/${key}`}
      className={`${styles.item} ${key === section ? styles.active : ''}`}
      aria-current={key === section ? 'page' : undefined}
    ><Icon size={15} aria-hidden="true" />{label}</Link>)}
  </nav>;
}
