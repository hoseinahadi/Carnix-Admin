// features/products/models/ProductMarketing.ts
export interface ProductBundleDto {
  productBundleId: number;
  title: string;
  description?: string | null;
  price: number;
  isActive: boolean;
  isDiscounted: boolean;
  discountPercentage?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ProductBundleItemDto {
  productBundleItemId: number;
  productBundleId: number;
  productId: number;
  productSKUID?: number | null;
  quantity: number;
  unitPriceAtCreation: number;
}

export interface ProductDiscountDto {
  productDiscountId: number;
  productId: number;
  title: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  minimumPurchaseAmount?: number | null;
  maxUsageCount?: number | null;
  currentUsageCount: number;
}

export interface ProductWarrantyDto {
  productWarrantyId: number;
  productId: number;
  productSKUID?: number | null;
  title: string;
  providerName: string;
  warrantyPeriodMonths: number;
  termsAndConditions?: string | null;
  isActive: boolean;
  startDate?: string | null;
}
