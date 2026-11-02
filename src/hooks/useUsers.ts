import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "@/services/user/user.service";
import type {
  UserCreateInput,
  UserQueryParams,
  UserUpdateInput,
} from "@/services/user/types/user";

export const USER_QUERY_KEYS = {
  all: ["users"] as const,
  lists: () => [...USER_QUERY_KEYS.all, "list"] as const,
  list: (params?: UserQueryParams) => [...USER_QUERY_KEYS.lists(), params] as const,
  details: () => [...USER_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.details(), id] as const,
};

export function useUsersList(params?: UserQueryParams) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.list(params),
    queryFn: () => getAllUsers(params),
  });
}

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(id),
    queryFn: () => getUserById(id),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserCreateInput) => createUser(data),
    onSuccess: () => {
      toast.success("Pengguna berhasil didaftarkan");
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal mendaftarkan pengguna";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UserUpdateInput;
    }) => updateUser(id, data),
    onSuccess: (_res, variables) => {
      toast.success("Data pengguna berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal memperbarui pengguna";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success("Pengguna berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menghapus pengguna";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

