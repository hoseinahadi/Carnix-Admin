import { createSlice } from '@reduxjs/toolkit';
import type { ProductSEODto, TagDto, ProductTagDto, ProductSimilarityDto } from '@/models/product/ProductSeoAndTags';
import { 
  fetchProductSeo, saveProductSeo,
  fetchAllTags, fetchProductTags, assignTagToProduct, removeTagFromProduct,
  fetchSimilarProducts, addSimilarProduct, removeSimilarProduct
} from './ProductMetaThunks';

interface ProductMetaState {
  seo: ProductSEODto | null;
  globalTags: TagDto[];
  productTags: ProductTagDto[];
  similarProducts: ProductSimilarityDto[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: ProductMetaState = {
  seo: null, globalTags: [], productTags: [], similarProducts: [],
  loading: false, actionLoading: false, error: null,
};

const productMetaSlice = createSlice({
  name: 'productMeta',
  initialState,
  reducers: {
    clearMetaError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    // --- Loadings & Errors ---
    const setPending = (state: ProductMetaState) => { state.loading = true; state.error = null; };
    const setActionPending = (state: ProductMetaState) => { state.actionLoading = true; state.error = null; };
    const setRejected = (state: ProductMetaState, action: any) => { state.loading = false; state.actionLoading = false; state.error = action.payload; };

    // --- SEO ---
    builder
      .addCase(fetchProductSeo.pending, setPending)
      .addCase(fetchProductSeo.fulfilled, (state, action) => { state.loading = false; state.seo = action.payload; })
      .addCase(fetchProductSeo.rejected, setRejected)
      .addCase(saveProductSeo.pending, setActionPending)
      .addCase(saveProductSeo.fulfilled, (state, action) => { state.actionLoading = false; state.seo = action.payload; })
      .addCase(saveProductSeo.rejected, setRejected);

    // --- Tags ---
    builder
      .addCase(fetchAllTags.fulfilled, (state, action) => { state.globalTags = action.payload; })
      .addCase(fetchProductTags.fulfilled, (state, action) => { state.productTags = action.payload; })
      
      .addCase(assignTagToProduct.pending, setActionPending)
      .addCase(assignTagToProduct.fulfilled, (state, action) => { state.actionLoading = false; state.productTags.push(action.payload); })
      .addCase(assignTagToProduct.rejected, setRejected)
      
      .addCase(removeTagFromProduct.fulfilled, (state, action) => {
        state.productTags = state.productTags.filter(t => t.productTagId !== action.payload);
      });

    // --- Similarities ---
    builder
      .addCase(fetchSimilarProducts.pending, setPending)
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => { state.loading = false; state.similarProducts = action.payload; })
      
      .addCase(addSimilarProduct.pending, setActionPending)
      .addCase(addSimilarProduct.fulfilled, (state, action) => { state.actionLoading = false; state.similarProducts.push(action.payload); })
      .addCase(addSimilarProduct.rejected, setRejected)
      
      .addCase(removeSimilarProduct.fulfilled, (state, action) => {
        state.similarProducts = state.similarProducts.filter(s => s.productSimilarityId !== action.payload);
      });
  },
});

export const { clearMetaError } = productMetaSlice.actions;
export default productMetaSlice.reducer;
