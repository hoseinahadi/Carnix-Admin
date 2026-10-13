import { ControllerActionPermissionDto } from "./ControllerActionPermissionDto";
import { PermissionItem } from "./PermissionItem";

export interface PermissionUpdateDto {
  RoleId: number;
  Permissions: PermissionItem[];
}
