// src/redux/features/auth/authSelectors.ts
import { RootState } from '@/redux/store/index'

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectUser = (state: RootState) => state.auth.user
export const selectToken = (state: RootState) => state.auth.token
