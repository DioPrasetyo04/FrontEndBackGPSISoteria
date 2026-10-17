import { routeGlobalInstance, routePrivateInstance } from "@/lib/config_backend";
import type { BaseResponse } from "@/types/BaseResponse";
import type {
  Gallery,
  GalleryListResponseData,
  GalleryQueryParams,
} from "./types/gallery";

export const getAllGallery = async (
  params?: GalleryQueryParams
): Promise<BaseResponse<GalleryListResponseData>> => {
  const response = await routeGlobalInstance.get("/gallery", { params });
  return response.data;
};

export const getGalleryById = async (
  id: string
): Promise<BaseResponse<{ gallery: Gallery }>> => {
  const response = await routeGlobalInstance.get(`/gallery/${id}`);
  return response.data;
};

export const createGallery = async (
  data: FormData | Record<string, unknown>
): Promise<BaseResponse<{ gallery: Gallery }>> => {
  const isFormData = data instanceof FormData;
  const response = await routePrivateInstance.post("/gallery", data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
};

export const updateGallery = async (
  id: string,
  data: FormData | Record<string, unknown>
): Promise<BaseResponse<{ gallery: Gallery }>> => {
  const isFormData = data instanceof FormData;
  const response = await routePrivateInstance.put(`/gallery/${id}`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
};

export const deleteGallery = async (
  id: string
): Promise<BaseResponse<null>> => {
  const response = await routePrivateInstance.delete(`/gallery/${id}`);
  return response.data;
};
