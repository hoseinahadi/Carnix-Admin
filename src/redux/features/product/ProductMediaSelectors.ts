// features/products/store/media/ProductMediaSelectors.ts

import type { RootState } from '../../store/index';

export const selectProductImages = (state: RootState) => state.productMedia.images;
export const selectProductVideos = (state: RootState) => state.productMedia.videos;
export const selectProduct360Views = (state: RootState) => state.productMedia.views360;
export const selectMediaLoading = (state: RootState) => state.productMedia.loading;
export const selectMediaActionLoading = (state: RootState) => state.productMedia.actionLoading;
export const selectMediaError = (state: RootState) => state.productMedia.error;
