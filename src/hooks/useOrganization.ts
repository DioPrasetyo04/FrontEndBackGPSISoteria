import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from "@/services/organization/organization.service";
import type {
  OrganizationCreateInput,
  OrganizationQueryParams,
  OrganizationUpdateInput,
} from "@/services/organization/types/organization";

export const ORGANIZATION_QUERY_KEYS = {
  all: ["organization"] as const,
  lists: () => [...ORGANIZATION_QUERY_KEYS.all, "list"] as const,
  list: (params?: OrganizationQueryParams) => [...ORGANIZATION_QUERY_KEYS.lists(), params] as const,
  details: () => [...ORGANIZATION_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...ORGANIZATION_QUERY_KEYS.details(), id] as const,
};

export function useOrganizationList(params?: OrganizationQueryParams) {
  return useQuery({
    queryKey: ORGANIZATION_QUERY_KEYS.list(params),
    queryFn: () => getAllOrganizations(params),
  });
}

export function useOrganizationDetail(id: string) {
  return useQuery({
    queryKey: ORGANIZATION_QUERY_KEYS.detail(id),
    queryFn: () => getOrganizationById(id),
    enabled: Boolean(id),
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrganizationCreateInput) => createOrganization(data),
    onSuccess: () => {
      toast.success("Anggota organisasi berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menambahkan anggota organisasi";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: OrganizationUpdateInput;
    }) => updateOrganization(id, data),
    onSuccess: (_res, variables) => {
      toast.success("Anggota organisasi berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal memperbarui anggota organisasi";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOrganization(id),
    onSuccess: () => {
      toast.success("Anggota organisasi berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menghapus anggota organisasi";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });
}

