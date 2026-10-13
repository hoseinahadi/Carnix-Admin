// models/Permission/RolePermission.ts
export interface RolePermission {
  projectAreaControllerActionId: number;
  projectActionId: number;
  projectControllerId: number;
  roleId: number;
  isAccess: boolean;
}
