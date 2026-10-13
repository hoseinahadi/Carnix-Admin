// features/brand/selectors/BrandSelectors.ts
import type { RootState } from '../../store/index';

export const selectBrands = (state: RootState) => state.brands.brands;
export const selectSelectedBrand = (state: RootState) => state.brands.selectedBrand;
export const selectBrandsLoading = (state: RootState) => state.brands.loading;
export const selectBrandsActionLoading = (state: RootState) => state.brands.actionLoading;
export const selectBrandsError = (state: RootState) => state.brands.error;
