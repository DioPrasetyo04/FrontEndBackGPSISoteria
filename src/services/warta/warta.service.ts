import { routeGlobalInstance, routePrivateInstance } from "@/lib/config_backend";
import type { BaseResponse } from "@/types/BaseResponse";
import type {
  Warta,
  WartaListResponseData,
  WartaQueryParams,
} from "./types/warta";

export const getAllWarta = async (
  params?: WartaQueryParams
): Promise<BaseResponse<WartaListResponseData>> => {
  const response = await routeGlobalInstance.get("/warta", { params });
  return response.data;
};

export const getWartaBySlug = async (
  slug: string
): Promise<BaseResponse<{ warta: Warta }>> => {
  const response = await routeGlobalInstance.get(`/warta/${slug}`);
  return response.data;
};

export const createWarta = async (
  data: FormData | Record<string, unknown>
): Promise<BaseResponse<{ warta: Warta }>> => {
  const isFormData = data instanceof FormData;
  const response = await routePrivateInstance.post("/warta", data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
};

export const updateWarta = async (
  slug: string,
  data: FormData | Record<string, unknown>
): Promise<BaseResponse<{ warta: Warta }>> => {
  const isFormData = data instanceof FormData;
  const response = await routePrivateInstance.put(`/warta/${slug}`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
};

export const deleteWarta = async (
  slug: string
): Promise<BaseResponse<null>> => {
  const response = await routePrivateInstance.delete(`/warta/${slug}`);
  return response.data;
};
