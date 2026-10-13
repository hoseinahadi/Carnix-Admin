export interface ProductSKUAttributeDto {
  productSkuAttributeId: number;
  skuId: number;
  featureId: number;
  optionId?: number | null;
  valueText?: string | null;
  valueNumeric?: number | null;
  displayOrder: number;
  isActive: boolean;
}