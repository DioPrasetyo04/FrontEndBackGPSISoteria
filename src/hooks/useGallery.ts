import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllGallery,
  getGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
} from "@/services/gallery/gallery.service";
import type { GalleryQueryParams } from "@/services/gallery/types/gallery";

export const GALLERY_QUERY_KEYS = {
  all: ["gallery"] as const,
  lists: () => [...GALLERY_QUERY_KEYS.all, "list"] as const,
  list: (params?: GalleryQueryParams) => [...GALLERY_QUERY_KEYS.lists(), params] as const,
  details: () => [...GALLERY_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...GALLERY_QUERY_KEYS.details(), id] as const,
};

export function useGalleryList(params?: GalleryQueryParams) {
  return useQuery({
    queryKey: GALLERY_QUERY_KEYS.list(params),
    queryFn: () => getAllGallery(params),
  });
}

export function useGalleryDetail(id: string) {
  return useQuery({
    queryKey: GALLERY_QUERY_KEYS.detail(id),
    queryFn: () => getGalleryById(id),
    enabled: Boolean(id),
  });
}

export function useCreateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData | Record<string, unknown>) => createGallery(data),
    onSuccess: () => {
      toast.success("Foto galeri berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menambahkan foto galeri";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

export function useUpdateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: FormData | Record<string, unknown>;
    }) => updateGallery(id, data),
    onSuccess: (_res, variables) => {
      toast.success("Foto galeri berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal memperbarui foto galeri";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

export function useDeleteGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGallery(id),
    onSuccess: () => {
      toast.success("Foto galeri berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menghapus foto galeri";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

