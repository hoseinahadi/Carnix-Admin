export interface RoleCreate {
  roleName: string;
  displayName: string;
  description: string;
  roleLevel: number;
  isActive: boolean;
}