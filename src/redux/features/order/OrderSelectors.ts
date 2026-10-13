// features/adminOrder/selectors/orderselectors.ts

import type { RootState } from '../../store/index';

export const selectOrders = (state: RootState) => state.orders.orders;
export const selectSelectedOrder = (state: RootState) => state.orders.selectedOrder;
export const selectOrdersLoading = (state: RootState) => state.orders.loading;
export const selectOrdersActionLoading = (state: RootState) => state.orders.actionLoading;
export const selectOrdersError = (state: RootState) => state.orders.error;
