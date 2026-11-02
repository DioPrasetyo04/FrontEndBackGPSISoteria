import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllJadwal,
  getJadwalById,
  createJadwal,
  updateJadwal,
  deleteJadwal,
} from "@/services/jadwal/jadwal.service";
import type {
  JadwalCreateInput,
  JadwalQueryParams,
  JadwalUpdateInput,
} from "@/services/jadwal/types/jadwal";

export const JADWAL_QUERY_KEYS = {
  all: ["jadwal"] as const,
  lists: () => [...JADWAL_QUERY_KEYS.all, "list"] as const,
  list: (params?: JadwalQueryParams) => [...JADWAL_QUERY_KEYS.lists(), params] as const,
  details: () => [...JADWAL_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...JADWAL_QUERY_KEYS.details(), id] as const,
};

export function useJadwalList(params?: JadwalQueryParams) {
  return useQuery({
    queryKey: JADWAL_QUERY_KEYS.list(params),
    queryFn: () => getAllJadwal(params),
  });
}

export function useJadwalDetail(id: string) {
  return useQuery({
    queryKey: JADWAL_QUERY_KEYS.detail(id),
    queryFn: () => getJadwalById(id),
    enabled: Boolean(id),
  });
}

export function useCreateJadwal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JadwalCreateInput) => createJadwal(data),
    onSuccess: () => {
      toast.success("Jadwal ibadah berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: JADWAL_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menambahkan jadwal";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

export function useUpdateJadwal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: JadwalUpdateInput;
    }) => updateJadwal(id, data),
    onSuccess: (_res, variables) => {
      toast.success("Jadwal ibadah berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: JADWAL_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: JADWAL_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal memperbarui jadwal";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

export function useDeleteJadwal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteJadwal(id),
    onSuccess: () => {
      toast.success("Jadwal ibadah berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: JADWAL_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menghapus jadwal";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

