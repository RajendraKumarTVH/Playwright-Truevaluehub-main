export interface RoleModel {
  roleId: number;
  roleName: string;
  rolePermissions: PermissionModel[];
}

export interface PermissionModel {
  roleId: string;
  permissionId: number;
  rolePermissionId: number;
}
export class UserModel {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  title?: string;
  roleId: number;
  role?: RoleModel;
  status: boolean;
  id: number;
  clientId: number;
  userId: number;
  userName: string;
  userType: number;
  client: ClientModel;
  clientGroupId?: number;
  imageContent?: string;
  isInternalUser?: boolean;
}

export class ProjectUserDto {
  projectUserId: number;
  projectInfoId: number;
  userId: number;
  isDeleted: boolean;
}
export class SelectedProjectUser {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  projectUserId: number;
  projectInfoId: number;
  isSelected: boolean;
}
export class UpdateUserRequest {
  userId: number;
  roleId: number;
  middleName?: string;
  phoneNumber?: string;
  title?: string;
  imageContent?: string;
  clientGroupId?: number;
}

export class ReportModel {
  reportId: number;
  clientId: number;
  reportName: string;
  reportUrl: string;
  reportIdentifier: string;
  groupId: string;
  isActive: string;
}

export class ClientGroupModel {
  groupId: number;
  clientId: number;
  groupName: string;
}

export class ClientModel {
  clientId: number;
  clientName: string;
  logoRelativePath: string;
  clientKey: string;
  numberOfDecimals: number;
  uomId: number;
  reports: ReportModel[];
  clientGroups: ClientGroupModel[];
  baseUrl: string;
  widgetScript: string;
}

export enum UserRoleTypeEnum {
  Admin = 'Admin',
  Sourcing = 'Sourcing',
  Executive = 'Executive',
  Costing = 'Costing',
  Supplier = 'Supplier',
}
export enum UserRoleEnum {
  Admin = 1,
  Sourcing = 2,
  Executive = 3,
  Costing = 4,
  Supplier = 5,
}

export enum UserStatusTypeEnum {
  Active = 'Active',
  InActive = 'In Active',
}

export interface WorkflowProcessDto {
  workflowProcessId: number;
  workflowProcessName: string;
  orderNumber: number;
  iconName?: string;
  colorCode?: string;
  canUpdate: boolean;
  canShowInWorkFlow?: boolean;
}

export interface WorkflowProcessMapDto {
  workflowProcessMapId: number;
  workflowProcessKey: number;
  workflowProcessValue: number;
}

export interface WorkflowProcessStatusDto {
  workflowProcessStatusId: number;
  projectInfoId: number;
  currentWorkFlowId: number;
  completedWorkFlowId: number;
  createDate: Date;
  createdUserId: number;
}
