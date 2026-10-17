import { routeGlobalInstance, routePrivateInstance } from "@/lib/config_backend";
import type { BaseResponse } from "@/types/BaseResponse";
import type {
  Renungan,
  RenunganListResponseData,
  RenunganQueryParams,
} from "./types/renungan";

export const getAllRenungan = async (
  params?: RenunganQueryParams
): Promise<BaseResponse<RenunganListResponseData>> => {
  const response = await routeGlobalInstance.get("/renungan", { params });
  return response.data;
};

export const getRenunganBySlug = async (
  slug: string
): Promise<BaseResponse<{ renungan: Renungan }>> => {
  const response = await routeGlobalInstance.get(`/renungan/${slug}`);
  return response.data;
};

export const createRenungan = async (
  data: FormData | Record<string, unknown>
): Promise<BaseResponse<{ renungan: Renungan }>> => {
  const isFormData = data instanceof FormData;
  const response = await routePrivateInstance.post("/renungan", data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
};

export const updateRenungan = async (
  slug: string,
  data: FormData | Record<string, unknown>
): Promise<BaseResponse<{ renungan: Renungan }>> => {
  const isFormData = data instanceof FormData;
  const response = await routePrivateInstance.put(`/renungan/${slug}`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
};

export const deleteRenungan = async (
  slug: string
): Promise<BaseResponse<null>> => {
  const response = await routePrivateInstance.delete(`/renungan/${slug}`);
  return response.data;
};
