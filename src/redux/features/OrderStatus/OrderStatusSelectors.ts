// features/orderStatus/selectors/OrderStatusSelectors.ts

import type { RootState } from '../../store/index';

export const selectOrderStatuses = (state: RootState) => state.orderStatuses.orderStatuses;
export const selectSelectedOrderStatus = (state: RootState) => state.orderStatuses.selectedOrderStatus;
export const selectOrderStatusesLoading = (state: RootState) => state.orderStatuses.loading;
export const selectOrderStatusesActionLoading = (state: RootState) => state.orderStatuses.actionLoading;
export const selectOrderStatusesError = (state: RootState) => state.orderStatuses.error;
