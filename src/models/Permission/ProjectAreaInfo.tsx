import { ProjectControllerInfo } from "./ProjectControllerInfo";

export interface ProjectActionInfo {
  projectActionId: number;
  actionName: string;
  httpMethod: string;
  route: string;
  description: string;
  isSensitive: boolean;
  requiresAuthentication: boolean;
}