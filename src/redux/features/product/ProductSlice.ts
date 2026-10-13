// features/products/store/ProductSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/models/product/Product';
import { ProductDetails } from '@/models/product/ProductDetails';
import {
  getAllProducts,
  getProductDetails,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from './ProductThunks';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null; // برای کارهای سریع مثل حذف/ویرایش ساده
  productDetails: ProductDetails | null; // برای نمایش در مدال جزئیات
  loading: boolean;
  detailsLoading: boolean; // لودینگ اختصاصی برای مدال
  actionLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  productDetails: null,
  loading: false,
  detailsLoading: false,
  actionLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    clearProductDetails: (state) => {
      state.productDetails = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ─── GetAll ───
    builder
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ─── GetDetails (برای مدال) ───
    builder
      .addCase(getProductDetails.pending, (state) => {
        state.detailsLoading = true;
        state.productDetails = null;
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.productDetails = action.payload;
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload as string;
      });

    // ─── Create ───
    builder
      .addCase(createProduct.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // ─── Update ───
    builder
      .addCase(updateProduct.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.products.findIndex(p => p.productId === action.payload.productId);
        if (index !== -1) state.products[index] = action.payload;
        // اگر محصول در حال ویرایش همان محصولِ مدال است، آن را هم آپدیت کن
        if(state.productDetails?.productId === action.payload.productId) {
             state.productDetails = { ...state.productDetails, ...action.payload };
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // ─── Delete ───
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.products = state.products.filter(p => p.productId !== action.payload);
    });

    // ─── Toggle Status ───
    builder.addCase(toggleProductStatus.fulfilled, (state, action) => {
      const index = state.products.findIndex(p => p.productId === action.payload.productId);
      if (index !== -1) state.products[index] = action.payload;
    });
  },
});

export const { setSelectedProduct, clearProductDetails, clearError } = productSlice.actions;
export default productSlice.reducer;
