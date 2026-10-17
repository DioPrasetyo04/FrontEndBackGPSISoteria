import { routeGlobalInstance, routePrivateInstance } from "@/lib/config_backend";
import type { BaseResponse } from "@/types/BaseResponse";
import type {
  Organization,
  OrganizationCreateInput,
  OrganizationListResponseData,
  OrganizationQueryParams,
  OrganizationUpdateInput,
} from "./types/organization";

export const getAllOrganizations = async (
  params?: OrganizationQueryParams
): Promise<BaseResponse<OrganizationListResponseData>> => {
  const response = await routeGlobalInstance.get("/organization", { params });
  return response.data;
};

export const getOrganizationById = async (
  id: string
): Promise<BaseResponse<{ organization: Organization }>> => {
  const response = await routeGlobalInstance.get(`/organization/${id}`);
  return response.data;
};

export const createOrganization = async (
  data: OrganizationCreateInput
): Promise<BaseResponse<{ organization: Organization }>> => {
  const response = await routePrivateInstance.post("/organization", data);
  return response.data;
};

export const updateOrganization = async (
  id: string,
  data: OrganizationUpdateInput
): Promise<BaseResponse<{ organization: Organization }>> => {
  const response = await routePrivateInstance.put(`/organization/${id}`, data);
  return response.data;
};

export const deleteOrganization = async (
  id: string
): Promise<BaseResponse<null>> => {
  const response = await routePrivateInstance.delete(`/organization/${id}`);
  return response.data;
};
