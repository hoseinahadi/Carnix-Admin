import { ProjectActionInfo } from "./ProjectActionInfo";

export interface ProjectControllerInfo {
  projectControllerId: number;
  controllerName: string;
  moduleName: string;
  description: string;
  baseRoute: string;
  actions: ProjectActionInfo[];
}