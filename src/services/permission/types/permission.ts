import type { UserRole } from "@/services/user/types/user";

export interface PermissionDefinition {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface PermissionModuleGroup {
  module: string;
  title: string;
  permissions: PermissionDefinition[];
}

export interface RoleInfo {
  role: UserRole;
  label: string;
  description: string;
}

export interface PermissionsMetaResponse {
  modules: PermissionModuleGroup[];
  allPermissions: PermissionDefinition[];
  defaultRolePermissions: Record<UserRole, string[]>;
  availableRoles: RoleInfo[];
}

export type RolePermissionMatrix = Record<UserRole, string[]>;

export interface UserPermissionDetail {
  id: string;
  name: string;
  email: string;
  primaryRole: UserRole;
  roles: UserRole[];
  customPermissions: string[];
  effectivePermissions: string[];
}

export interface UpdateRolePermissionPayload {
  permissions: string[];
  description?: string;
}

export interface UpdateUserPermissionsPayload {
  role?: UserRole;
  roles?: UserRole[];
  customPermissions?: string[];
}
