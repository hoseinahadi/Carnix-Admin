// features/brand/store/BrandSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Brand } from '@/models/Brand/Brand';
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from './BrandThunks';

interface BrandState {
  brands: Brand[];
  selectedBrand: Brand | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: BrandState = {
  brands: [],
  selectedBrand: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const brandSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {
    setSelectedBrand: (state, action: PayloadAction<Brand | null>) => {
      state.selectedBrand = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // GetAll
    builder
      .addCase(getAllBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload; // دیتای کامل و معتبر سرور
      })
      .addCase(getAllBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // GetById
    builder
      .addCase(getBrandById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBrandById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBrand = action.payload;
      })
      .addCase(getBrandById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createBrand.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createBrand.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateBrand.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateBrand.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Delete
    builder
      .addCase(deleteBrand.pending, (state) => {
         state.actionLoading = true;
      })
      .addCase(deleteBrand.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedBrand, clearError } = brandSlice.actions;
export default brandSlice.reducer;
