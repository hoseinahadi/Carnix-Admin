import { createSlice } from '@reduxjs/toolkit';
import type { ProductDiscountDto, ProductWarrantyDto } from '@/models/product/ProductMarketing';
import { 
  fetchDiscounts, createDiscount, updateDiscount, deleteDiscount,
  fetchWarranties, createWarranty, updateWarranty, deleteWarranty 
} from './ProductMarketingThunks';

interface ProductMarketingState {
  discounts: ProductDiscountDto[];
  warranties: ProductWarrantyDto[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: ProductMarketingState = {
  discounts: [], warranties: [], loading: false, actionLoading: false, error: null,
};

const productMarketingSlice = createSlice({
  name: 'productMarketing',
  initialState,
  reducers: {
    clearMarketingError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    // --- Data Loading ---
    builder
      .addCase(fetchDiscounts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDiscounts.fulfilled, (state, action) => { state.loading = false; state.discounts = action.payload; })
      .addCase(fetchDiscounts.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      
      .addCase(fetchWarranties.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWarranties.fulfilled, (state, action) => { state.loading = false; state.warranties = action.payload; })
      .addCase(fetchWarranties.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // --- Actions (Discounts) ---
    builder
      .addCase(createDiscount.pending, (state) => { state.actionLoading = true; })
      .addCase(createDiscount.fulfilled, (state, action) => { state.actionLoading = false; state.discounts.push(action.payload); })
      .addCase(createDiscount.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload as string; })
      
      .addCase(updateDiscount.fulfilled, (state, action) => {
        const index = state.discounts.findIndex(d => d.productDiscountId === action.payload.productDiscountId);
        if (index !== -1) state.discounts[index] = action.payload;
      })
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.discounts = state.discounts.filter(d => d.productDiscountId !== action.payload);
      });

    // --- Actions (Warranties) ---
    builder
      .addCase(createWarranty.pending, (state) => { state.actionLoading = true; })
      .addCase(createWarranty.fulfilled, (state, action) => { state.actionLoading = false; state.warranties.push(action.payload); })
      .addCase(createWarranty.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload as string; })
      
      .addCase(updateWarranty.fulfilled, (state, action) => {
        const index = state.warranties.findIndex(w => w.productWarrantyId === action.payload.productWarrantyId);
        if (index !== -1) state.warranties[index] = action.payload;
      })
      .addCase(deleteWarranty.fulfilled, (state, action) => {
        state.warranties = state.warranties.filter(w => w.productWarrantyId !== action.payload);
      });
  },
});

export const { clearMarketingError } = productMarketingSlice.actions;
export default productMarketingSlice.reducer;
