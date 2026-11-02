import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPermissionsMeta,
  getRolePermissionsMatrix,
  updateRolePermission,
  getUserPermissions,
  updateUserPermissions,
} from "@/services/permission/permission.service";
import type {
  UpdateRolePermissionPayload,
  UpdateUserPermissionsPayload,
} from "@/services/permission/types/permission";
import type { UserRole } from "@/services/user/types/user";

export function usePermissionsMeta() {
  return useQuery({
    queryKey: ["roles-permissions", "meta"],
    queryFn: getPermissionsMeta,
  });
}

export function useRolePermissionsMatrix() {
  return useQuery({
    queryKey: ["roles-permissions", "matrix"],
    queryFn: getRolePermissionsMatrix,
  });
}

export function useUpdateRolePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      role,
      data,
    }: {
      role: UserRole;
      data: UpdateRolePermissionPayload;
    }) => updateRolePermission(role, data),
    onSuccess: () => {
      toast.success("Perizinan role berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["roles-permissions"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal memperbarui perizinan role";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: ["roles-permissions", "user", userId],
    queryFn: () => getUserPermissions(userId),
    enabled: Boolean(userId),
  });
}

export function useUpdateUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateUserPermissionsPayload;
    }) => updateUserPermissions(userId, data),
    onSuccess: (_res, variables) => {
      toast.success("Izin pengguna berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["roles-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["roles-permissions", "user", variables.userId] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal memperbarui izin pengguna";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

