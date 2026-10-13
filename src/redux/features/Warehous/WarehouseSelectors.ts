// features/warehouse/selectors/WarehouseSelectors.ts
import type { RootState } from '../../store/index';

export const selectWarehouses = (state: RootState) => state.warehouses.warehouses;
export const selectActiveWarehouses = (state: RootState) => state.warehouses.activeWarehouses;
export const selectSelectedWarehouse = (state: RootState) => state.warehouses.selectedWarehouse;
export const selectWarehousesLoading = (state: RootState) => state.warehouses.loading;
export const selectWarehousesActionLoading = (state: RootState) => state.warehouses.actionLoading;
export const selectWarehousesError = (state: RootState) => state.warehouses.error;
