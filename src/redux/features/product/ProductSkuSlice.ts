// features/products/store/sku/ProductSkuSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ProductSkuDto } from '@/models/product/ProductSku';
import { getSkusByProductId, createSku, updateSku, deleteSku } from './ProductSkuThunks';

interface ProductSkuState {
  skus: ProductSkuDto[];
  selectedSku: ProductSkuDto | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: ProductSkuState = {
  skus: [],
  selectedSku: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const productSkuSlice = createSlice({
  name: 'productSku',
  initialState,
  reducers: {
    setSelectedSku: (state, action: PayloadAction<ProductSkuDto | null>) => {
      state.selectedSku = action.payload;
    },
    clearSkuError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ─── Get By ProductId ───────────────────────────────────────────
      .addCase(getSkusByProductId.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(getSkusByProductId.fulfilled, (state, action) => {
        state.loading = false; state.skus = action.payload;
      })
      .addCase(getSkusByProductId.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      // ─── Create ───────────────────────────────────────────
      .addCase(createSku.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createSku.fulfilled, (state, action) => {
        state.actionLoading = false; state.skus.push(action.payload);
      })
      .addCase(createSku.rejected, (state, action) => {
        state.actionLoading = false; state.error = action.payload as string;
      })
      // ─── Update ───────────────────────────────────────────
      .addCase(updateSku.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateSku.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.skus.findIndex((s) => s.productSkuid === action.payload.skuId);
        if (index !== -1) state.skus[index] = action.payload;
      })
      .addCase(updateSku.rejected, (state, action) => {
        state.actionLoading = false; state.error = action.payload as string;
      })
      // ─── Delete ───────────────────────────────────────────
      .addCase(deleteSku.fulfilled, (state, action) => {
        state.skus = state.skus.filter((s) => s.productSkuid !== action.payload);
      });
  },
});

export const { setSelectedSku, clearSkuError } = productSkuSlice.actions;
export default productSkuSlice.reducer;
