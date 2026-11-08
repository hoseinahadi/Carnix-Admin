'use client';

import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { resources } from '@/lib/resources';
import { ResourceManager } from '@/components/ResourceManager';
import { ProductTools } from '@/components/ProductTools';
import { FeatureValuesWorkspace } from '@/components/FeatureValuesWorkspace';
import { WorkspaceNav } from '@/components/WorkspaceNav';
import { CommerceSettingsWorkspace } from '@/components/CommerceSettingsWorkspace';
import { VehicleCatalogWorkspace } from '@/components/VehicleCatalogWorkspace';
import { ProductAssetsWorkspace } from '@/components/ProductAssetsWorkspace';
import { AccessWorkspace } from '@/components/AccessWorkspace';
import { SalesWorkspace } from '@/components/SalesWorkspace';
import { CampaignWorkspace } from '@/components/CampaignWorkspace';
import { ContentWorkspace } from '@/components/ContentWorkspace';
import { InventoryManagementWorkspace } from '@/components/InventoryManagementWorkspace';
import { CatalogWorkspace } from '@/components/CatalogWorkspace';
import { IsacoSyncWorkspace } from '@/components/IsacoSyncWorkspace';

export default function Page() {
  const params = useParams<{ section: string }>();
  const section = String(params.section);

  const withWorkspace = (content: ReactNode) => <><WorkspaceNav section={section} />{content}</>;

  if (section === 'permissions' || section === 'roles') return <AccessWorkspace section={section}/>;
  if (section === 'productTools') return withWorkspace(<ProductTools />);
  if (section === 'featureValues') return withWorkspace(<FeatureValuesWorkspace />);
  if (section === 'inventory' || section === 'warehouses') return <InventoryManagementWorkspace section={section}/>;
  if (['products', 'categories', 'brands', 'features'].includes(section)) return <CatalogWorkspace section={section as 'products' | 'categories' | 'brands' | 'features'}/>;
  if (['orders', 'carrierAssignments', 'tickets', 'orderStatuses', 'carts', 'priceHistory'].includes(section)) return <SalesWorkspace section={section as 'orders' | 'carrierAssignments' | 'tickets' | 'orderStatuses' | 'carts' | 'priceHistory'}/>;
  if (section === 'productDiscounts' || section === 'bundles') return <CampaignWorkspace section={section}/>;
  if (section === 'contents' || section === 'reviews') return <ContentWorkspace section={section}/>;
  if (section === 'shippingMethods' || section === 'paymentMethods') return withWorkspace(<CommerceSettingsWorkspace />);
  if (section === 'isaco-sync') return <IsacoSyncWorkspace />;
  if (section === 'vehiclesMakes' || section === 'vehiclesModels') return withWorkspace(<VehicleCatalogWorkspace />);
  if (['images', 'media', 'videos', 'views360'].includes(section)) return <ProductAssetsWorkspace section={section}/>;

  const config = resources[section];
  if (!config) return <div className="error-state card"><b>بخش پیدا نشد</b><span>کلید «{section}» در تنظیمات پنل وجود ندارد.</span></div>;
  return withWorkspace(<ResourceManager key={section} config={config} />);
}
// Test
