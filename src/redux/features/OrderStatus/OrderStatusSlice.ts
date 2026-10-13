// features/orderStatus/store/OrderStatusSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { OrderStatusDto } from '@/api/OrderStatus/OrderStatusApi'; // مسیر ایمپورت تایپ را با توجه به پروژه تنظیم کنید
import {
  getAllOrderStatuses,
  getOrderStatusById,
  createOrderStatus,
  updateOrderStatus,
  deleteOrderStatus,
} from './OrderStatusThunks';

interface OrderStatusState {
  orderStatuses: OrderStatusDto[];
  selectedOrderStatus: OrderStatusDto | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: OrderStatusState = {
  orderStatuses: [],
  selectedOrderStatus: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const orderStatusSlice = createSlice({
  name: 'orderStatuses',
  initialState,
  reducers: {
    setSelectedOrderStatus: (state, action: PayloadAction<OrderStatusDto | null>) => {
      state.selectedOrderStatus = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // GetAll
    builder
      .addCase(getAllOrderStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrderStatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.orderStatuses = action.payload;
      })
      .addCase(getAllOrderStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // GetById
    builder
      .addCase(getOrderStatusById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderStatusById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrderStatus = action.payload;
      })
      .addCase(getOrderStatusById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createOrderStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createOrderStatus.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(createOrderStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Delete
    builder
      .addCase(deleteOrderStatus.pending, (state) => {
         state.actionLoading = true;
      })
      .addCase(deleteOrderStatus.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteOrderStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedOrderStatus, clearError } = orderStatusSlice.actions;
export default orderStatusSlice.reducer;
