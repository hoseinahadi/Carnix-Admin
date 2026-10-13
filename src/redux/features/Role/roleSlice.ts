// src/redux/features/Roles/RoleSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import { Role } from '@/models/Role/Role'
import { getAllRole, updateRole, deleteRole, createRole } from './roleThunks'
import { RootState } from '@/redux/store'

interface RoleState {
  Roles: Role[]
  loading: boolean
  error: string | null
}

const initialState: RoleState = {
  Roles: [],
  loading: false,
  error: null,
}

const RoleSlice = createSlice({
  name: 'Roles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // getAll
      .addCase(getAllRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllRole.fulfilled, (state, action) => {
        state.Roles = action.payload
        state.loading = false
      })
      .addCase(getAllRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // create
      .addCase(createRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.Roles.unshift(action.payload)
        state.loading = false
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // update
      .addCase(updateRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        // تغییر u به role برای خوانایی بهتر
        const index = state.Roles.findIndex(role => role.RoleId === action.payload.RoleId)
        if (index !== -1) state.Roles[index] = action.payload
        state.loading = false
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // delete
      .addCase(deleteRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        // تغییر u به role
        state.Roles = state.Roles.filter(role => role.RoleId !== action.payload)
        state.loading = false
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = RoleSlice.actions

// ----------------------------------------------------
// Selectors (مورد نیاز برای RoleList.tsx)
// *توجه: کلمه 'roles' در state.roles باید دقیقا همان نامی باشد
// که در فایل store.ts به این ردیوسر اختصاص داده‌اید.
// ----------------------------------------------------
export const selectRoles = (state: RootState) => state.role?.Roles || [];
export const selectRolesLoading = (state: RootState) => state.role?.loading || false;
export const selectRolesError = (state: any) => state.role.error;

export default RoleSlice.reducer
