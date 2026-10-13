// features/products/store/inventory/ProductInventorySelectors.ts

import type { RootState } from '../../store/index';

export const selectInventories = (state: RootState) => state.productInventory.inventories;
export const selectInventoryLoading = (state: RootState) => state.productInventory.loading;
export const selectInventoryActionLoading = (state: RootState) => state.productInventory.actionLoading;
export const selectInventoryError = (state: RootState) => state.productInventory.error;
