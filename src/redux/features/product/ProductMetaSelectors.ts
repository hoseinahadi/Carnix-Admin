

import type { RootState } from '@/redux/store/index';

export const selectProductSeo = (state: RootState) => state.productMeta.seo;
export const selectGlobalTags = (state: RootState) => state.productMeta.globalTags;
export const selectProductTags = (state: RootState) => state.productMeta.productTags;
export const selectSimilarProducts = (state: RootState) => state.productMeta.similarProducts;
export const selectMetaLoading = (state: RootState) => state.productMeta.loading;
export const selectMetaActionLoading = (state: RootState) => state.productMeta.actionLoading;
export const selectMetaError = (state: RootState) => state.productMeta.error;
