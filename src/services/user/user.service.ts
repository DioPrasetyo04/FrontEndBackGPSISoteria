import { routePrivateInstance } from "@/lib/config_backend";
import type { BaseResponse } from "@/types/BaseResponse";
import type {
  UserCreateInput,
  UserItem,
  UserListResponseData,
  UserQueryParams,
  UserUpdateInput,
} from "./types/user";

export const getAllUsers = async (
  params?: UserQueryParams
): Promise<BaseResponse<UserListResponseData>> => {
  const response = await routePrivateInstance.get("/users", { params });
  return response.data;
};

export const getUserById = async (
  id: string
): Promise<BaseResponse<{ user: UserItem }>> => {
  const response = await routePrivateInstance.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (
  data: UserCreateInput
): Promise<BaseResponse<{ user: UserItem }>> => {
  const response = await routePrivateInstance.post("/users", data);
  return response.data;
};

export const updateUser = async (
  id: string,
  data: UserUpdateInput
): Promise<BaseResponse<{ user: UserItem }>> => {
  const response = await routePrivateInstance.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (
  id: string
): Promise<BaseResponse<null>> => {
  const response = await routePrivateInstance.delete(`/users/${id}`);
  return response.data;
};