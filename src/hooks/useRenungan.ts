import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllRenungan,
  getRenunganBySlug,
  createRenungan,
  updateRenungan,
  deleteRenungan,
} from "@/services/renungan/renungan.service";
import type { RenunganQueryParams } from "@/services/renungan/types/renungan";

export const RENUNGAN_QUERY_KEYS = {
  all: ["renungan"] as const,
  lists: () => [...RENUNGAN_QUERY_KEYS.all, "list"] as const,
  list: (params?: RenunganQueryParams) => [...RENUNGAN_QUERY_KEYS.lists(), params] as const,
  details: () => [...RENUNGAN_QUERY_KEYS.all, "detail"] as const,
  detail: (slug: string) => [...RENUNGAN_QUERY_KEYS.details(), slug] as const,
};

export function useRenunganList(params?: RenunganQueryParams) {
  return useQuery({
    queryKey: RENUNGAN_QUERY_KEYS.list(params),
    queryFn: () => getAllRenungan(params),
  });
}

export function useRenunganDetail(slug: string) {
  return useQuery({
    queryKey: RENUNGAN_QUERY_KEYS.detail(slug),
    queryFn: () => getRenunganBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateRenungan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData | Record<string, unknown>) => createRenungan(data),
    onSuccess: () => {
      toast.success("Renungan berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: RENUNGAN_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menambahkan renungan";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

export function useUpdateRenungan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      slug,
      data,
    }: {
      slug: string;
      data: FormData | Record<string, unknown>;
    }) => updateRenungan(slug, data),
    onSuccess: (_res, variables) => {
      toast.success("Renungan berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: RENUNGAN_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RENUNGAN_QUERY_KEYS.detail(variables.slug) });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal memperbarui renungan";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

export function useDeleteRenungan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => deleteRenungan(slug),
    onSuccess: () => {
      toast.success("Renungan berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: RENUNGAN_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menghapus renungan";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

