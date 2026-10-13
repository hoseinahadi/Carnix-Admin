// src/store/Permission/PermissionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProjectAreaInfo } from '@/models/Permission/ProjectAreaInfo';
import {  RolePermission } from '@/models/Permission/RolePermission';
import {
  fetchProjectStructure,
  fetchRolePermissions,
  updateRolePermissions,
  assignRolesToUser
} from './PermissionThunks';

// تعریف نوع (Type) برای استیت دسترسی‌ها
interface PermissionState {
  projectStructure: ProjectAreaInfo[]; // درختواره کامل پروژه
  rolePermissions: RolePermission[];   // دسترسی‌های تیک خورده برای نقش فعلی
  loading: boolean;
  error: string | null;
  updateSuccess: boolean;              // فلگی برای نمایش پیغام موفقیت در کامپوننت
}

const initialState: PermissionState = {
  projectStructure: [],
  rolePermissions: [],
  loading: false,
  error: null,
  updateSuccess: false,
};

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    // برای پاک کردن استیت موفقیت بعد از نمایش Toast در UI
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    // برای خالی کردن دسترسی‌ها هنگام خروج از صفحه ویرایش نقش
    clearRolePermissions: (state) => {
      state.rolePermissions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Project Structure ---
      .addCase(fetchProjectStructure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectStructure.fulfilled, (state, action: PayloadAction<ProjectAreaInfo[]>) => {
        state.loading = false;
        state.projectStructure = action.payload;
      })
      .addCase(fetchProjectStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Fetch Role Permissions ---
      .addCase(fetchRolePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action: PayloadAction<RolePermission[]>) => {
        state.loading = false;
        state.rolePermissions = action.payload;
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Update Role Permissions ---
      .addCase(updateRolePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateRolePermissions.fulfilled, (state) => {
        state.loading = false;
        state.updateSuccess = true;
      })
      .addCase(updateRolePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Assign Roles To User ---
      .addCase(assignRolesToUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(assignRolesToUser.fulfilled, (state) => {
        state.loading = false;
        state.updateSuccess = true;
      })
      .addCase(assignRolesToUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// اکسپورت کردن اکشن‌های معمولی
export const { resetUpdateSuccess, clearRolePermissions } = permissionSlice.actions;

// --- Selectors (برای استفاده در useSelector) ---
// نکته: نام کلید در RootState باید با نام ثبت شده در store.ts مطابقت داشته باشد (اینجا permission فرض شده)
export const selectProjectStructure = (state: any) => state.permission?.projectStructure || [];
export const selectRolePermissions = (state: any) => state.permission?.rolePermissions || [];
export const selectPermissionLoading = (state: any) => state.permission?.loading || false;
export const selectPermissionError = (state: any) => state.permission?.error || null;
export const selectPermissionUpdateSuccess = (state: any) => state.permission?.updateSuccess || false;

export default permissionSlice.reducer;
