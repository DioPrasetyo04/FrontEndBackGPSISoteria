import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllWarta,
  getWartaBySlug,
  createWarta,
  updateWarta,
  deleteWarta,
} from "@/services/warta/warta.service";
import type { WartaQueryParams } from "@/services/warta/types/warta";

export const WARTA_QUERY_KEYS = {
  all: ["warta"] as const,
  lists: () => [...WARTA_QUERY_KEYS.all, "list"] as const,
  list: (params?: WartaQueryParams) => [...WARTA_QUERY_KEYS.lists(), params] as const,
  details: () => [...WARTA_QUERY_KEYS.all, "detail"] as const,
  detail: (slug: string) => [...WARTA_QUERY_KEYS.details(), slug] as const,
};

export function useWartaList(params?: WartaQueryParams) {
  return useQuery({
    queryKey: WARTA_QUERY_KEYS.list(params),
    queryFn: () => getAllWarta(params),
  });
}

export function useWartaDetail(slug: string) {
  return useQuery({
    queryKey: WARTA_QUERY_KEYS.detail(slug),
    queryFn: () => getWartaBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateWarta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData | Record<string, unknown>) => createWarta(data),
    onSuccess: () => {
      toast.success("Warta jemaat berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: WARTA_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menambahkan warta";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

export function useUpdateWarta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      slug,
      data,
    }: {
      slug: string;
      data: FormData | Record<string, unknown>;
    }) => updateWarta(slug, data),
    onSuccess: (_res, variables) => {
      toast.success("Warta jemaat berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: WARTA_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: WARTA_QUERY_KEYS.detail(variables.slug) });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal memperbarui warta";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

export function useDeleteWarta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => deleteWarta(slug),
    onSuccess: () => {
      toast.success("Warta jemaat berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: WARTA_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menghapus warta";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

