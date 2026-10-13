export interface ProductPriceHistoryDto {
  ProductPriceHistoryid: number; // یا productId در نسخه دیگر DTO شما
  productId: number;
  skuId?: number | null;
  oldPrice: number;
  newPrice: number;
  oldDiscountedPrice?: number | null;
  newDiscountedPrice?: number | null;
  reason?: string | null;
}
