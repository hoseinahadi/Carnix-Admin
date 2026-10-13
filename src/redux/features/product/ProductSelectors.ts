// features/products/selectors/ProductSelectors.ts
import type { RootState } from '../../store/index';

export const selectProducts = (state: RootState) => state.products.products;
export const selectProductsLoading = (state: RootState) => state.products.loading;
export const selectDetailsLoading = (state: RootState) => state.products.detailsLoading;
export const selectProductsActionLoading = (state: RootState) => state.products.actionLoading;
export const selectProductsError = (state: RootState) => state.products.error;
export const selectSelectedProduct = (state: RootState) => state.products.selectedProduct;
// سلکتور مخصوص مدال جزئیات
export const selectProductDetails = (state: RootState) => state.products.productDetails;
