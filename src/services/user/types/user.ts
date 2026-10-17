import type { PaginationMeta } from "@/types/BaseResponse";

export type UserRole =
  | "ADMIN"
  | "SUPER_ADMIN"
  | "PENGELOLA"
  | "KOORSEK"
  | "PHMJ"
  | "MAJELIS";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
  customPermissions?: string[];
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export type UserSortOption =
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "email_asc"
  | "email_desc";

export interface UserQueryParams {
  q?: string;
  sort?: UserSortOption;
  page?: number;
  limit?: number;
}

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  roles?: UserRole[];
  customPermissions?: string[];
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  roles?: UserRole[];
  customPermissions?: string[];
}

export interface UserListResponseData {
  items: UserItem[];
  pagination: PaginationMeta;
  users?: UserItem[];
}
