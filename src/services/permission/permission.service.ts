import { routePrivateInstance } from "@/lib/config_backend";
import type { BaseResponse } from "@/types/BaseResponse";
import type {
  PermissionsMetaResponse,
  RolePermissionMatrix,
  UserPermissionDetail,
  UpdateRolePermissionPayload,
  UpdateUserPermissionsPayload,
} from "./types/permission";
import type { UserRole } from "@/services/user/types/user";

/**
 * Mengambil metadata seluruh modul perizinan dan definisi izin yang ada di sistem.
 */
export const getPermissionsMeta = async (): Promise<
  BaseResponse<PermissionsMetaResponse>
> => {
  const response = await routePrivateInstance.get(
    "/roles-permissions/meta",
  );
  return response.data;
};

/**
 * Mengambil matriks konfigurasi izin untuk seluruh role.
 */
export const getRolePermissionsMatrix = async (): Promise<
  BaseResponse<RolePermissionMatrix>
> => {
  const response = await routePrivateInstance.get(
    "/roles-permissions/matrix",
  );
  return response.data;
};

/**
 * Memperbarui daftar izin untuk sebuah role tertentu.
 */
export const updateRolePermission = async (
  role: UserRole,
  data: UpdateRolePermissionPayload,
): Promise<BaseResponse<any>> => {
  const response = await routePrivateInstance.put(
    `/roles-permissions/${role}`,
    data,
  );
  return response.data;
};

/**
 * Mengambil detail peran dan perizinan spesifik seorang user.
 */
export const getUserPermissions = async (
  userId: string,
): Promise<BaseResponse<UserPermissionDetail>> => {
  const response = await routePrivateInstance.get(
    `/roles-permissions/users/${userId}`,
  );
  return response.data;
};

/**
 * Mengubah multiple roles dan perizinan kustom seorang user.
 */
export const updateUserPermissions = async (
  userId: string,
  data: UpdateUserPermissionsPayload,
): Promise<BaseResponse<UserPermissionDetail>> => {
  const response = await routePrivateInstance.put(
    `/roles-permissions/users/${userId}`,
    data,
  );
  return response.data;
};
