// features/products/store/sku/ProductSkuSelectors.ts

import type { RootState } from '../../store/index';

export const selectSkus = (state: RootState) => state.productSku.skus;
export const selectSkuLoading = (state: RootState) => state.productSku.loading;
export const selectSkuActionLoading = (state: RootState) => state.productSku.actionLoading;
export const selectSkuError = (state: RootState) => state.productSku.error;
export const selectSelectedSku = (state: RootState) => state.productSku.selectedSku;
