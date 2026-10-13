// features/products/store/media/ProductMediaSlice.ts

import { createSlice } from '@reduxjs/toolkit';
import type { ProductImageDto, ProductVideoDto, Product360ViewDto } from '@/models/product/ProductMedia';
import { 
  getProductImages, addProductImage, deleteProductImage,
  getProductVideos, addProductVideo, deleteProductVideo,
  getProduct360Views 
} from './ProductMediaThunks';

interface ProductMediaState {
  images: ProductImageDto[];
  videos: ProductVideoDto[];
  views360: Product360ViewDto[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: ProductMediaState = {
  images: [], videos: [], views360: [], loading: false, actionLoading: false, error: null,
};

const productMediaSlice = createSlice({
  name: 'productMedia',
  initialState,
  reducers: {
    clearMediaError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      // Images
      .addCase(getProductImages.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getProductImages.fulfilled, (state, action) => { state.loading = false; state.images = action.payload; })
      .addCase(getProductImages.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      
      .addCase(addProductImage.pending, (state) => { state.actionLoading = true; })
      .addCase(addProductImage.fulfilled, (state, action) => { state.actionLoading = false; state.images.push(action.payload); })
      .addCase(addProductImage.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload as string; })
      
      .addCase(deleteProductImage.fulfilled, (state, action) => { state.images = state.images.filter(img => img.productImageId !== action.payload); })

      // Videos
      .addCase(getProductVideos.fulfilled, (state, action) => { state.videos = action.payload; })
      .addCase(addProductVideo.fulfilled, (state, action) => { state.videos.push(action.payload); })
      .addCase(deleteProductVideo.fulfilled, (state, action) => { state.videos = state.videos.filter(vid => vid.productVideoId !== action.payload); })

      // 360 Views
      .addCase(getProduct360Views.fulfilled, (state, action) => { state.views360 = action.payload; });
  },
});

export const { clearMediaError } = productMediaSlice.actions;
export default productMediaSlice.reducer;
