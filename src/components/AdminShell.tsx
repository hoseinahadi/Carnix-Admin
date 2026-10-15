"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
// Test
import {
  Activity,
  Archive,
  BarChart3,
  Boxes,
  CarFront,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  FileText,
  FolderTree,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Truck,
  Users,
  Warehouse,
  X,
  type LucideIcon,
} from 'lucide-react';
import { navGroups } from '@/lib/resources';
import { useAuth } from './AuthProvider';
import styles from './AdminShell.module.scss';

const icons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  products: Package,
  categories: FolderTree,
  brands: Tag,
  tags: Tag,
  features: Settings2,
  featureOptions: Boxes,
  featureValues: Activity,
  categoryFeatures: FolderTree,
  skus: Archive,
  media: Image,
  images: Image,
  productTools: Settings2,
  priceHistory: BarChart3,
  shippingMethods: Truck,
  paymentMethods: ShoppingCart,
  videos: FileText,
  views360: Activity,
  warranties: ShieldCheck,
  orders: ShoppingCart,
  orderStatuses: Activity,
  carts: ShoppingCart,
  productDiscounts: Tag,
  bundles: Boxes,
  warehouses: Warehouse,
  inventory: Warehouse,
  users: Users,
  roles: ShieldCheck,
  permissions: ShieldCheck,
  contents: FileText,
  reviews: CircleHelp,
  vehiclesMakes: CarFront,
  vehiclesModels: CarFront,
  'api-center': Activity,
};

type NavGroup = (typeof navGroups)[number];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user, logout } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(([key, label]) => !needle || key.toLocaleLowerCase().includes(needle) || label.toLocaleLowerCase().includes(needle)),
      }))
      .filter((group) => group.items.length);
  }, [query]);

  const currentLabel = useMemo(() => {
    for (const group of navGroups as readonly NavGroup[]) {
      const item = group.items.find(([key]) => (key === 'dashboard' ? path === '/admin/dashboard' : key === 'api-center' ? path === '/admin/api-center' : path.startsWith(`/admin/${key}`)));
      if (item) return item[1];
    }
    return 'داشبورد مدیریتی';
  }, [path]);

  const closeMobile = () => setMobileOpen(false);
  const initials = String(user?.name || user?.firstName || user?.userName || 'مدیر').trim().slice(0, 1);
  const displayName = user?.name || user?.firstName || user?.userName || 'مدیر سیستم';

  return (
    <div className={`${styles.shell} ${sidebarExpanded ? styles.expanded : styles.collapsed}`}>
      <a href="#admin-main" className={styles.skipLink}>پرش به محتوای اصلی</a>
      {mobileOpen && <button className={styles.overlay} aria-label="بستن منوی کناری" onClick={closeMobile} />}

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ''}`} aria-label="ناوبری مدیریت">
        <div className={styles.brandRow}>
          <Link href="/admin/dashboard" className={styles.brand} onClick={closeMobile} aria-label="داشبورد Carnix">
            <span className={styles.brandMark}>C</span>
            <span className={styles.brandCopy}><strong>Carnix</strong><small>Admin workspace</small></span>
          </Link>
          <button className={styles.sidebarAction} onClick={() => setMobileOpen(false)} aria-label="بستن منو"><X size={18} /></button>
        </div>

        <div className={styles.sidebarSearch}>
          <Search size={16} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی بخش‌ها" aria-label="جست‌وجوی منوی مدیریت" />
          {query && <button onClick={() => setQuery('')} aria-label="پاک کردن جست‌وجو"><X size={14} /></button>}
        </div>

        <nav className={styles.nav}>
          {groups.map((group) => {
            const isCollapsed = collapsedGroups[group.title] && !query;
            return (
              <section className={styles.navGroup} key={group.title}>
                <button className={styles.groupTitle} onClick={() => setCollapsedGroups((state) => ({ ...state, [group.title]: !state[group.title] }))} aria-expanded={!isCollapsed}>
                  <span>{group.title}</span><ChevronDown size={14} className={isCollapsed ? styles.chevronCollapsed : ''} />
                </button>
                {!isCollapsed && group.items.map(([key, label]) => {
                  const href = key === 'dashboard' ? '/admin/dashboard' : key === 'api-center' ? '/admin/api-center' : `/admin/${key}`;
                  const active = key === 'dashboard' ? path === href : path === href || path.startsWith(`${href}/`);
                  const Icon = icons[key] || Package;
                  return <Link href={href} key={key} onClick={closeMobile} className={`${styles.navLink} ${active ? styles.active : ''}`} aria-current={active ? 'page' : undefined} title={!sidebarExpanded ? label : undefined}><Icon size={18} strokeWidth={active ? 2.3 : 1.8} /><span>{label}</span><ChevronLeft size={14} className={styles.linkArrow} /></Link>;
                })}
              </section>
            );
          })}
        </nav>

        <div className={styles.accountCard}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.accountText}><strong>{displayName}</strong><small>{user?.email || user?.phoneNumber || 'نشست فعال'}</small></div>
          <button onClick={() => void logout()} aria-label="خروج از حساب" title="خروج"><LogOut size={17} /></button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarStart}>
            <button className={`${styles.iconButton} ${styles.mobileMenu}`} onClick={() => setMobileOpen(true)} aria-label="باز کردن منوی کناری"><Menu size={20} /></button>
            <button className={`${styles.iconButton} ${styles.desktopToggle}`} onClick={() => setSidebarExpanded((value) => !value)} aria-label={sidebarExpanded ? 'جمع کردن منو' : 'باز کردن منو'}>{sidebarExpanded ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />}</button>
            <div className={styles.breadcrumb}><span>مدیریت Carnix</span><ChevronLeft size={14} /><strong>{currentLabel}</strong></div>
          </div>
          <div className={styles.topbarEnd}>
            <Link href={process.env.NEXT_PUBLIC_STORE_URL || 'https://carnix.ir'} target="_blank" rel="noreferrer" className={styles.storeLink}>مشاهده فروشگاه <ChevronLeft size={15} /></Link>
            <div className={styles.topAvatar}>{initials}</div>
          </div>
        </header>
        <div id="admin-main" className={`${styles.content} admin-v3-content`}>{children}</div>
      </main>
    </div>
  );
}
// Test
