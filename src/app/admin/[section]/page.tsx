'use client';

import { useParams } from 'next/navigation';
import { resources } from '@/lib/resources';
import { ResourceManager } from '@/components/ResourceManager';
import { Permissions, Reviews } from '@/components/SpecialSections';
import { OrdersManager } from '@/components/OperationsSections';
import { InventoryWorkspace } from '@/components/InventoryWorkspace';
import { ArticleContentManager } from '@/components/ArticleContentManager';
import { ProductTools } from '@/components/ProductTools';
import { FeatureValuesWorkspace } from '@/components/FeatureValuesWorkspace';

export default function Page() {
  const params = useParams<{ section: string }>();
  const section = String(params.section);

  if (section === 'permissions') return <Permissions />;
  if (section === 'productTools') return <ProductTools />;
  if (section === 'featureValues') return <FeatureValuesWorkspace />;
  if (section === 'reviews') return <Reviews />;
  if (section === 'inventory') return <InventoryWorkspace />;
  if (section === 'orders') return <OrdersManager />;
  if (section === 'contents') return <ArticleContentManager />;

  const config = resources[section];
  if (!config) return <div className="error-state card"><b>بخش پیدا نشد</b><span>کلید «{section}» در تنظیمات پنل وجود ندارد.</span></div>;
  return <ResourceManager key={section} config={config} />;
}
