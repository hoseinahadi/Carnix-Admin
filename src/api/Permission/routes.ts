// src/api/services/PermissionApi.ts
import axiosInstance from '@/api/common/axiosInstance';
import { AssignRoleDto } from '@/models/Permission/AssignRoleDto';
  import { PermissionUpdateDto} from '@/models/Permission/PermissionUpdateDto';
 import {  ProjectAreaInfo } from '@/models/Permission/ProjectAreaInfo';
  import {  RolePermission } from '@/models/Permission/RolePermission';

export const PermissionApi = {
  /**
   * تخصیص یک یا چند نقش به یک کاربر خاص
   */
  assignRolesToUser: async (payload: AssignRoleDto) => {
    return await axiosInstance.post('/Permissions/AssignRolesToUser', payload);
  },

  /**
   * دریافت ساختار کامل پروژه (Area -> Controller -> Action)
   * برای ساخت درختواره (TreeView) در UI
   */
  getProjectStructure: async (roleId: number) => {
  return await axiosInstance.get<ProjectAreaInfo[]>(`/Permissions/GetProjectStructure/${roleId}`);
},

  /**
   * دریافت لیست دسترسی‌های ثبت شده برای یک نقش خاص
   */
  getRolePermissions: async (roleId: number) => {
    return await axiosInstance.get<RolePermission[]>(`/Permissions/GetRolePermissions/${roleId}`);
  },

  /**
   * ارسال و ذخیره دسترسی‌های جدید/ویرایش شده برای یک نقش
   */
  updateRolePermissions: async (payload: PermissionUpdateDto) => {
    return await axiosInstance.post('/Permissions/UpdateRolePermissions', payload);
  }
};
