// features/adminOrder/store/AdminOrderSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { OrderDto } from '@/models/order/Order';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  changeOrderStatus,
  cancelOrder,
  placeOrderAdmin
} from './OrderThunks';

interface AdminOrderState {
  orders: OrderDto[];
  selectedOrder: OrderDto | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: AdminOrderState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const adminOrderSlice = createSlice({
  name: 'adminOrders',
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<OrderDto | null>) => {
      state.selectedOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // GetAll
    builder
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // GetById
    builder
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createOrder.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateOrder.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.orders.findIndex(o => o.orderId === action.payload.orderId);
        if (index !== -1) state.orders[index] = action.payload;
        
        if (state.selectedOrder?.orderId === action.payload.orderId) {
          state.selectedOrder = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Delete
    builder
      .addCase(deleteOrder.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.orders = state.orders.filter(o => o.orderId !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Change Status (Business Operation)
    builder
      .addCase(changeOrderStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(changeOrderStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { id, newStatus } = action.payload;
        
        // آپدیت وضعیت در لیست سفارشات
        const order = state.orders.find(o => o.orderId === id);
        if (order) order.status = newStatus;

        // آپدیت وضعیت در سفارش انتخاب شده (جزئیات)
        if (state.selectedOrder?.orderId === id) {
          state.selectedOrder.status = newStatus;
        }
      })
      .addCase(changeOrderStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Cancel Order (Business Operation)
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        const id = action.payload;
        
        const order = state.orders.find(o => o.orderId === id);
        if (order) order.status = 'Cancelled'; // یا هر استاتوسی که برای لغو استفاده می‌کنید

        if (state.selectedOrder?.orderId === id) {
          state.selectedOrder.status = 'Cancelled';
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Place Order Admin
    builder
      .addCase(placeOrderAdmin.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(placeOrderAdmin.fulfilled, (state) => {
        state.actionLoading = false;
        // معمولاً بعد از این عملیات، توسعه‌دهنده متد getAllOrders را فراخوانی می‌کند 
        // تا لیست با سفارش جدید رفرش شود
      })
      .addCase(placeOrderAdmin.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedOrder, clearError } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;
