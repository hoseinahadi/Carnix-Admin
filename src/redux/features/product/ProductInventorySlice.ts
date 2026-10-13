// features/products/store/inventory/ProductInventorySlice.ts

import { createSlice } from '@reduxjs/toolkit';
import type { WarehouseInventoryDto } from '@/models/product/ProductInventory';
import {
  getInventoryByProductId,
  getInventoryBySkuId,
  updateInventory,
  transferInventory,
  getInventoryByWarehouseId,
  adjustInventory,
  getLowStockProducts,
  reserveInventory,
  releaseInventory,
} from './ProductInventoryThunks';

interface ProductInventoryState {
  inventories: WarehouseInventoryDto[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: ProductInventoryState = {
  inventories: [],
  loading: false,
  actionLoading: false,
  error: null,
};

const productInventorySlice = createSlice({
  name: 'productInventory',
  initialState,
  reducers: {
    clearInventoryError: (state) => {
      state.error = null;
    },
    resetInventoryState: (state) => {
      state.inventories = [];
      state.loading = false;
      state.actionLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get By ProductId
      .addCase(getInventoryByProductId.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.inventories = [];
      })
      .addCase(getInventoryByProductId.fulfilled, (state, action) => {
        state.loading = false;
        state.inventories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getInventoryByProductId.rejected, (state, action) => {
        state.loading = false;
        state.inventories = [];
        state.error = (action.payload as string) ?? 'خطا در دریافت اطلاعات موجودی';
      })

      // Get By SkuId
      .addCase(getInventoryBySkuId.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.inventories = [];
      })
      .addCase(getInventoryBySkuId.fulfilled, (state, action) => {
        state.loading = false;
        state.inventories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getInventoryBySkuId.rejected, (state, action) => {
        state.loading = false;
        state.inventories = [];
        state.error = (action.payload as string) ?? 'خطا در دریافت اطلاعات موجودی';
      })

      // Update Inventory
      .addCase(updateInventory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateInventory.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (!action.payload) return;

        const updated = action.payload;
        const index = state.inventories.findIndex(
          (i) => i.warehouseId === updated.warehouseId && i.productId === updated.productId
        );

        if (index !== -1) {
          state.inventories[index] = updated;
        } else {
          state.inventories.push(updated);
        }
      })
      .addCase(updateInventory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = (action.payload as string) ?? 'خطا در بروزرسانی موجودی';
      })

      // Transfer Inventory
      .addCase(transferInventory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(transferInventory.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(transferInventory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = (action.payload as string) ?? 'خطا در انتقال موجودی';
      })

      // Get By WarehouseId
      .addCase(getInventoryByWarehouseId.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.inventories = [];
      })
      .addCase(getInventoryByWarehouseId.fulfilled, (state, action) => {
        state.loading = false;
        state.inventories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getInventoryByWarehouseId.rejected, (state, action) => {
        state.loading = false;
        state.inventories = [];
        state.error = (action.payload as string) ?? 'خطا در دریافت موجودی انبار';
      })

      // Adjust Inventory
      .addCase(adjustInventory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(adjustInventory.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(adjustInventory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = (action.payload as string) ?? 'خطا در تنظیم موجودی';
      })

      // Low Stock Products
      .addCase(getLowStockProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLowStockProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.inventories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getLowStockProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'خطا در دریافت محصولات کم موجودی';
      })

      // Reserve Inventory
      .addCase(reserveInventory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(reserveInventory.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(reserveInventory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = (action.payload as string) ?? 'خطا در رزرو موجودی';
      })

      // Release Inventory
      .addCase(releaseInventory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(releaseInventory.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(releaseInventory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = (action.payload as string) ?? 'خطا در آزادسازی موجودی';
      });
  },
});

export const { clearInventoryError, resetInventoryState } = productInventorySlice.actions;

export default productInventorySlice.reducer;
