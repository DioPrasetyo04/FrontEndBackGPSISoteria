import { routeGlobalInstance, routePrivateInstance } from "@/lib/config_backend";
import type { BaseResponse } from "@/types/BaseResponse";
import type {
  Jadwal,
  JadwalCreateInput,
  JadwalListResponseData,
  JadwalQueryParams,
  JadwalUpdateInput,
} from "./types/jadwal";

export const getAllJadwal = async (
  params?: JadwalQueryParams
): Promise<BaseResponse<JadwalListResponseData>> => {
  const response = await routeGlobalInstance.get("/jadwal", { params });
  return response.data;
};

export const getJadwalById = async (
  id: string
): Promise<BaseResponse<{ jadwal: Jadwal }>> => {
  const response = await routeGlobalInstance.get(`/jadwal/${id}`);
  return response.data;
};

export const createJadwal = async (
  data: JadwalCreateInput
): Promise<BaseResponse<{ jadwal: Jadwal }>> => {
  const response = await routePrivateInstance.post("/jadwal", data);
  return response.data;
};

export const updateJadwal = async (
  id: string,
  data: JadwalUpdateInput
): Promise<BaseResponse<{ jadwal: Jadwal }>> => {
  const response = await routePrivateInstance.put(`/jadwal/${id}`, data);
  return response.data;
};

export const deleteJadwal = async (
  id: string
): Promise<BaseResponse<null>> => {
  const response = await routePrivateInstance.delete(`/jadwal/${id}`);
  return response.data;
};
