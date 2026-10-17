import type { BaseResponse } from "@/types/BaseResponse";
import type {
  FacebookAuthInput,
  GoogleAuthInput,
  LoginInput,
  RegisterInput,
  ResendApprovalInput,
  ProcessApprovalInput,
} from "./validator/auth";
import type { LoginSchema } from "./types/auth";
import { routeGlobalInstance, routePrivateInstance } from "@/lib/config_backend";

export const login = async (
  data: LoginInput,
): Promise<BaseResponse<LoginSchema>> =>
  routeGlobalInstance.post("/auth/login", data).then((res) => res.data);

export const signUp = async (
  data: RegisterInput,
): Promise<BaseResponse<any>> =>
  routeGlobalInstance.post("/auth/register", data).then((res) => res.data);

export const resendApproval = async (
  data: ResendApprovalInput,
): Promise<BaseResponse<any>> =>
  routeGlobalInstance
    .post("/auth/resend-approval", data)
    .then((res) => res.data);

export const getApprovalInfo = async (
  token: string,
): Promise<BaseResponse<any>> =>
  routeGlobalInstance
    .get(`/auth/verify-approval-info?token=${encodeURIComponent(token)}`)
    .then((res) => res.data);

export const processApproval = async (
  data: ProcessApprovalInput,
): Promise<BaseResponse<any>> =>
  routeGlobalInstance
    .post("/auth/process-approval", data)
    .then((res) => res.data);

export const logout = async (): Promise<BaseResponse<null>> =>
  routePrivateInstance.post("/auth/logout").then((res) => res.data);

export const loginByGoogle = async (
  data: GoogleAuthInput,
): Promise<BaseResponse<LoginSchema>> =>
  routeGlobalInstance.post("/auth/google", data).then((res) => res.data);

export const loginByFacebook = async (
  data: FacebookAuthInput,
): Promise<BaseResponse<LoginSchema>> =>
  routeGlobalInstance.post("/auth/facebook", data).then((res) => res.data);