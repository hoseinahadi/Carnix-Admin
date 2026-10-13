// src/redux/features/auth/authSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import { User } from '@/models/auth/User'
import { loginThunk, getCurrentUserThunk, logoutThunk } from './authThunks'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
        state.loading = false
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // getCurrentUser
      .addCase(getCurrentUserThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCurrentUserThunk.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.loading = false
      })
      .addCase(getCurrentUserThunk.rejected, (state) => {
        state.token = null
        state.isAuthenticated = false
        state.loading = false
      })
      // logout
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loading = false
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.loading = false
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
